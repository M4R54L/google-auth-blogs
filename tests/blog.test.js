const { request } = require('express');
const Page = require('./helpers/page');

let page = new Page();

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using invalid inputs', async () => {
    test('the form shows an error message', async () => {
      await page.click('form button');

      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Título');
      await page.type('.content input', 'Contenido del blog');
      await page.click('form button');
    });

    test('Submitting takes user to review screen ', async () => {
      const pageTitle = await page.getContentsOf('form h5');
      expect(pageTitle).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page ', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('Título');
      expect(content).toEqual('Contenido del blog');
    });
  });
});

describe('When not logged in', async () => {
  test('And try to create a blog', async () => {
    const result = await page.post('/api/blogs', {
      title: 'My title',
      content: 'My content',
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('And try to get the blogs', async () => {
    const result = await page.get('/api/blogs');

    expect(result).toEqual({ error: 'You must log in!' });
  });
});
