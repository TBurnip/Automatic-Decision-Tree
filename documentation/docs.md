# GuideMe Docs


## **class** Page

### Attributes:

- **name**: (str) The name of the page
- **data**: (obj) json object containing the page's data, it has the structure:

```json
"pagename":{
    "filename": (str), //name of file to be used
    "title": (str), //title to be displayed in browser
    "info": (str), //the information to be displayed on the page. This can be formatted as html, NOTE: this is already enclosed in <p> tags in the template html so it is unsescessary in the json
    "subcats": (array) //all the subcategories to be displayed
}
```

and each element in the subcats array has the structure:
```json
{
    "name": (str), //name to be displayed in the element for the subcategory
    "link": (str), //the name of the page that it is linking to (or external hyperlink)
    "linkexternal": (bool), //true if link is external, false otherwise
}
```

### Methods


## **class** History

### Attributes:
- **full_hist**: (array) Constains the name of every page the user has visited during the session.
- **breadcrumb**: (array) The current path the user has taken form the index page, it does not contain duplicates and is reset every time the user returns to index.


## **class** Nav

### Atttributes

Nav is simply a container for several static methods used for navigation along with some helper functions. Its constructor is never intended to be called.

### Methods