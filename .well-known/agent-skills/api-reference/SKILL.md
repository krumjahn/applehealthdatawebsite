# Apple Health Data — API Reference

Describes the Mac Health Analyzer REST-style API for fetching Apple Health commit history.

## Endpoint

`GET https://applehealthdata.com/commits`

## Parameters

| Name | Type | Default | Description |
|---|---|---|---|
| page | integer | 1 | Page number (1–200) |
| per_page | integer | 10 | Results per page (1–50) |

## Response

Returns a JSON array of GitHub commit objects from the MacHealthAnalyzer repository.

## Example

```
GET https://applehealthdata.com/commits?page=1&per_page=5
```

## Documentation

Full documentation: https://applehealthdata.com/docs/api-reference.html
