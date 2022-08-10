# IFLS

Ever wanted to just not write that function? Well now you can with I'm Feeling Lucky Script!

All you need to do is just *hope* it works on the day and all will be good

## Example
Example *.ifls file:

```js
// No special characters
ifls function genPassword1(length);

console.log(genPassword1(16));

// Generate a password with special characters
ifls function genPassword2(length);

console.log(genPassword2(16));
```

Output:

```js
function genPassword1(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

console.log(genPassword1(16));

function genPassword2(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}

console.log(genPassword2(16));
```

## Config

Make a file named `iflsconfig.json` in the source of your project and add the following entries:
```json
{
  "version": "1",
  "outDir": "./test/build",
  "srcDir": "./test/src",
  "openAIApiKey": "xxx"
}

```

or you can just pass them as arguments using the following
|property||
|---|--|
|configDir|--config, -c|
|outDir|--out-dir, -o|
|apiKey|--api-key, -a, -k|
|srcDir|anywhere

## TODO

- Add support for nested files in the srcDir