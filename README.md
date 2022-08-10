# IFLS

Ever wanted to just not write that function? Well now you can with I'm Feeling Lucky Script!

All you need to do is just *hope* it works on the day and all will be good

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