import { encode } from './encode';

describe('Basic encoding tests', () => {
  test('Encode sentence without punctuation', () => {
    const encoded = encode('Hello world');
    expect(encoded.text).toEqual('hellworlnonoede');
    expect(encoded.separators).toEqual([8]);
  });

  test('Encode long text', () => {
    const encoded = encode('Hellooooooooooooooooooooooo');
    expect(encoded.text).toEqual('helloooooooooooooooooooooononoåa');
    expect(encoded.separators).toEqual([26]);
  });

  test('Encode sentence with punctuation', () => {
    const encoded = encode('Hello world!');
    expect(encoded.text).toEqual('hellworlnonoede!');
    expect(encoded.separators).toEqual([8]);
  });

  test('Encode sentence with full stop', () => {
    const encoded = encode('Hello world.');
    expect(encoded.text).toEqual('hellworlnonoede.');
    expect(encoded.separators).toEqual([8]);
  });

  test('Encode sentence with punctuation after whitespace', () => {
    const encoded = encode('Hello world !');
    expect(encoded.text).toEqual('hellworlnonoede!');
    expect(encoded.separators).toEqual([8]);
  });

  test('Encode text of multiple sentences', () => {
    const encoded = encode('Hello! world?');
    expect(encoded.text).toEqual('hellnonoe!worlnonde?');
    expect(encoded.separators).toEqual([4, 14]);
  });
});

describe('Encoding tests with special punctuation', () => {
  test('Encode sentence with quotations', () => {
    const encoded = encode('Hello "world"');
    expect(encoded.text).toEqual('hell"worlnonde"nonoe');
    expect(encoded.separators).toEqual([9, 15]);
  });

  test('Encode sentence with nested quotations', () => {
    const encoded = encode('Hello "foo \'bar\'"');
    expect(encoded.text).toEqual('hell"fo\'banonrc\'nonoc"nonoe');
    expect(encoded.separators).toEqual([10, 16, 22]);
  });

  test('Encode sentence with mismatching quotations', () => {
    expect(() => {
      encode('Hello "foo \'bar"');
    }).toThrow(Error);
  });
  
  test('Encode sentence with parentheses', () => {
    const encoded = encode('Hello (world)');
    expect(encoded.text).toEqual('hell(worlnonde)nonoe');
    expect(encoded.separators).toEqual([9, 15]);
  });
});

describe('Encoding tests with numbers', () => {
  test('Encode sentence with numbers as standalone words', () => {
    const encoded = encode('I have 5 apples');
    expect(encoded.text).toEqual('hav5applenoniaedsf');
    expect(encoded.separators).toEqual([9]);
  });
  
  test('Encode sentence with numbers at the end of words', () => {
    const encoded = encode('he110');
    expect(encoded.text).toEqual('henon110c');
    expect(encoded.separators).toEqual([2]);
  });
  
  test('Encode sentence with numbers within words', () => {
    const encoded = encode('help2man');
    expect(encoded.text).toEqual('help2manonnh');
    expect(encoded.separators).toEqual([7]);
  });
});

describe('Options tests', () => {
  test('copyAngleBracketContents not defined', () => {
    const encoded = encode('Hello <world>');
    expect(encoded.text).toEqual('hell<worlnonde>nonoe');
    expect(encoded.separators).toEqual([9, 15]);
  });
  
  test('copyAngleBracketContents defined as true', () => {
    const encoded = encode('Hello <world>', { copyAngleBracketContents: true });
    expect(encoded.text).toEqual('hell<world>nonoe');
    expect(encoded.separators).toEqual([11]);
  });
  
  test('copyAngleBracketContents defined as false', () => {
    const encoded = encode('Hello <world>', { copyAngleBracketContents: false });
    expect(encoded.text).toEqual('hell<worlnonde>nonoe');
    expect(encoded.separators).toEqual([9, 15]);
  });
});