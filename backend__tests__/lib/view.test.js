'use strict';

const fs = require('fs');
const view = require('../../backend/lib/view');

jest.mock('fs');

describe('backend/lib/view.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('retorna vista personalizada si existe', () => {
    fs.existsSync.mockReturnValue(true);

    const result = view('home/index', 'www.ejemplo.cl');

    expect(result).toBe('assets/domains/www.ejemplo.cl/home/index');
  });

  test('retorna vista original si no existe personalizada', () => {
    fs.existsSync.mockReturnValue(false);

    const result = view('home/index', 'www.ejemplo.cl');

    expect(result).toBe('home/index');
  });
});
