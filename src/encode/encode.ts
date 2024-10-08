export interface EncodedCocanbData {
  text: string;
  separators: Array<number>;
}

interface CocanbEncodeOptions {
  copyAngleBracketContents?: boolean;
}

let word: string;
let output: EncodedCocanbData = {
  text: '',
  separators: [],
};
let suffixes: Array<string>;
let quotes: Array<string>;

export function encode(
  input: string,
  options?: CocanbEncodeOptions
): EncodedCocanbData {
  word = '';
  output = {
    text: '',
    separators: [],
  };
  suffixes = ['non'];
  quotes = [];

  for (let i = 0; i < input.length; i++) {
    if (
      options !== undefined &&
      options.copyAngleBracketContents &&
      quotes[quotes.length - 1]
    ) {
      output.text = output.text.concat(input[i]);
      if (input[i] == '>') {
        quotes.pop();
      }
      continue;
    }
    switch (input[i]) {
      case ' ':
      case '\f':
      case '\n':
      case '\r':
      case '\t':
      case '\v':
        processWord();
        break;
      case '"':
      case "'":
        processWord();
        if (quotes.length == 0 || quotes[quotes.length - 1] != input[i]) {
          quotes.push(input[i]);
          suffixes.push('non');
        } else if (suffixes.length != quotes.length) {
          quotes.pop();
          output.separators.push(output.text.length);
          output.text = output.text.concat(suffixes.pop() as string);
        }
        output.text = output.text.concat(input[i]);
        break;
      case '<':
        if (options !== undefined && options.copyAngleBracketContents) {
          processWord();
          quotes.push(input[i]);
          output.text = output.text.concat(input[i]);
          break;
        }
      case '(':
      case '[':
      case '{':
        processWord();
        quotes.push(input[i]);
        suffixes.push('non');
        output.text = output.text.concat(input[i]);
        break;
      case ')':
        processWord();
        if (quotes.length != 0 && quotes[quotes.length - 1] == '(') {
          if (suffixes.length != quotes.length) {
            quotes.pop();
            output.separators.push(output.text.length);
            output.text = output.text.concat(suffixes.pop() as string);
          }
          output.text = output.text.concat(input[i]);
        } else {
          throw new Error();
        }
        break;
      case ']':
        processWord();
        if (quotes.length != 0 && quotes[quotes.length - 1] == '[') {
          if (suffixes.length != quotes.length) {
            quotes.pop();
            output.separators.push(output.text.length);
            output.text = output.text.concat(suffixes.pop() as string);
          }
          output.text = output.text.concat(input[i]);
        } else {
          throw new Error();
        }
        break;
      case '}':
        processWord();
        if (quotes.length != 0 && quotes[quotes.length - 1] == '{') {
          if (suffixes.length != quotes.length) {
            quotes.pop();
            output.separators.push(output.text.length);
            output.text = output.text.concat(suffixes.pop() as string);
          }
          output.text = output.text.concat(input[i]);
        } else {
          throw new Error();
        }
        break;
      case '>':
        processWord();
        if (quotes.length != 0 && quotes[quotes.length - 1] == '<') {
          if (suffixes.length != quotes.length) {
            quotes.pop();
            output.separators.push(output.text.length);
            output.text = output.text.concat(suffixes.pop() as string);
          }
          output.text = output.text.concat(input[i]);
        } else {
          throw new Error();
        }
        break;
      case '.':
      case '?':
      case '!':
        processWord();
        output.separators.push(output.text.length);
        output.text = output.text
          .concat(suffixes.pop() as string)
          .concat(input[i]);
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (word.length == 0) {
          output.text = output.text.concat(input[i]);
          break;
        }
      default:
        if (suffixes.length == quotes.length) {
          suffixes.push('non');
        }
        word = word.concat(input[i].toLowerCase());
        break;
    }
  }

  processWord();

  if (suffixes.length != 0) {
    if (quotes.length != 0) {
      throw new Error();
    }
    output.separators.push(output.text.length);
    output.text = output.text.concat(suffixes[suffixes.length - 1]);
  }

  return output;
}

function processWord() {
  if (word.length != 0) {
    let counted: number = 0;
    let lastPos: number = -1;

    for (let i = 0; i < word.length; i++) {
      if (lastPos == -1) {
        switch (word[i]) {
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '.':
          case ',':
            lastPos = i;
            break;
          default:
            break;
        }
        counted++;
      } else {
        switch (word[i]) {
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '.':
          case ',':
            break;
          default:
            lastPos = -1;
            counted++;
            break;
        }
      }
    }

    let quotient = Math.floor(counted / 26);
    let remainder = counted % 26;
    let prefixLength: number;
    if (lastPos == -1) {
      prefixLength = 1;
    } else {
      prefixLength = word.length - lastPos;
    }

    suffixes[suffixes.length - 1] = suffixes[suffixes.length - 1]
      .concat(word.substring(word.length - prefixLength))
      .concat('å'.repeat(quotient))
      .concat(String.fromCharCode(96 + remainder));
    output.text = output.text.concat(
      word.substring(0, word.length - prefixLength)
    );
    word = '';
  }
}
