import pystache,json


with open("template.html") as f:
    template = "".join(f)

with open("data.json") as f:
    data = json.load(f)

for page in data["Page"]:
    np = pystache.render(template,page)
    with open("static/"+page["filename"]+".html","w") as f:
        f.write(np)
