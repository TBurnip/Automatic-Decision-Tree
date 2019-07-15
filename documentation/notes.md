# Notes

## Todo's


## Goto Adviser

when ever you are directed to goto adviser this information is included

```json
{
    "why":"this is why",
    "what":"this is what"
}
```

```base64
eyJ3aHkiOiJ0aGlzIGlzIHdoeSIsIndoYXQiOiJ0aGlzIGlzIHdoYXQifQ==
```

this will be b64 encoded in the url

Glossary:
 - "why" is a short desciption of why you have been sent to your adviser
 - "what" is what you should tell you adviser


 ### Test 1

 ```json
{
    "why": "As you may have guessed changing degree programme is a major thing. Due to the nature of changing degrees you need to discuss it with your adviser so that you know all that is involved and how to go about it. It will also be useful to discuss why you want to change in case something in the department can be improved to yours and others benefit. And finally it will be important to ensure that you don't have to repeat a year due to a lack of credits in the degree you want to change to.",
    "what":"I'm thinking of changing degree from [current degree programme] to [possible future degree programme]. What is involved in this and How should I go about it?"
}
```

```base64
ewogICAgIndoeSI6ICJBcyB5b3UgbWF5IGhhdmUgZ3Vlc3NlZCBjaGFuZ2luZyBkZWdyZWUgcHJvZ3JhbW1lIGlzIGEgbWFqb3IgdGhpbmcuIER1ZSB0byB0aGUgbmF0dXJlIG9mIGNoYW5naW5nIGRlZ3JlZXMgeW91IG5lZWQgdG8gZGlzY3VzcyBpdCB3aXRoIHlvdXIgYWR2aXNlciBzbyB0aGF0IHlvdSBrbm93IGFsbCB0aGF0IGlzIGludm9sdmVkIGFuZCBob3cgdG8gZ28gYWJvdXQgaXQuIEl0IHdpbGwgYWxzbyBiZSB1c2VmdWwgdG8gZGlzY3VzcyB3aHkgeW91IHdhbnQgdG8gY2hhbmdlIGluIGNhc2Ugc29tZXRoaW5nIGluIHRoZSBkZXBhcnRtZW50IGNhbiBiZSBpbXByb3ZlZCB0byB5b3VycyBhbmQgb3RoZXJzIGJlbmVmaXQuIEFuZCBmaW5hbGx5IGl0IHdpbGwgYmUgaW1wb3J0YW50IHRvIGVuc3VyZSB0aGF0IHlvdSBkb24ndCBoYXZlIHRvIHJlcGVhdCBhIHllYXIgZHVlIHRvIGEgbGFjayBvZiBjcmVkaXRzIGluIHRoZSBkZWdyZWUgeW91IHdhbnQgdG8gY2hhbmdlIHRvLiIsCiAgICAid2hhdCI6IkknbSB0aGlua2luZyBvZiBjaGFuZ2luZyBkZWdyZWUgZnJvbSBbY3VycmVudCBkZWdyZWUgcHJvZ3JhbW1lXSB0byBbcG9zc2libGUgZnV0dXJlIGRlZ3JlZSBwcm9ncmFtbWVdLiBXaGF0IGlzIGludm9sdmVkIGluIHRoaXMgYW5kIEhvdyBzaG91bGQgSSBnbyBhYm91dCBpdD8iCn0=
```

## New Goto Adviser

Long story short the info dispalyed on the goto adviser page is nolonger passed through the url

## New data.json spec
New Spec. Also to improve the effciency of the client side js data.json will get some modification from a compiletime script. eg change interal links so that they work, add the type of a page you are linking to into the subcats section. This is currently done in js but seems more efficent when done at compile.
```json
{
    "compiled":false,
    "pages":{
        "[filename]":{
            "title": "",
            "type": "",
            "descp": "",
            "info": "",
            "subcats": [
                {
                    "name": "",
                    "link": "",
                    "linkexternal":false
                }
            ]
        },
    },
    "motm":{
        "0": "January",
        "11": "Decemebr"
    },
    "goto_adviser":{
        "[adviser section name]":{
            "who":"[sso or adviser]",
            "why":"",
            "what":"",
            "notesforadviser":""
        }
    }
}
```

## New History System and New Breadcrumb System

All links will now call a link handler rather than being links directly unless they are external.
This will enable the breadcumb trail to show you where you are in the tree rather than being a history.
This will also enable a slightly better tracking system for history. The exact button on the page that you clicked will be stored.

### Breadcrumb

This is how the breadcrumb trail will be stored lovely and simple

```json
["page1","page2"]
```

### History. Now journey System (this may never be implemented this is more a wish than a must)

Now for the maddness of the new journey system. This data will be used to create a journey page which will be displayed to the adviser from the link on the goto adviser page. This will show the path that the student took using vertical scrolling (i don't know if it will start from the most recent item or from the beginning).s

```json
[
    {
        "type":"[page or click]",
        "pagename":"[this only exist if type=page]",
        "clickname":"[this only exist if type=click]"
    }
]
```