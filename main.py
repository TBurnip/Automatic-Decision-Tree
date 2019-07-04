import pystache,json

template = {"category":"","action":"","advice":"","question":""}

for t in template:
    with open("template_"+ t +".html") as f:
        template[t] = "".join(f)

with open("data.json") as f:
    data = json.load(f)

for page in data["Page"]:
    if page["type"] in template:
        np = pystache.render(template[page["type"]],page)
        with open("static/"+page["filename"]+".html","w") as f:
            f.write(np)