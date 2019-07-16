import json

inputfile = "old.json"
outputfile = "new.json"

with open(inputfile) as f:
    data = json.load(f)

out = {}
out["pages"] = {}


for pages in data["Page"]:
    out["pages"][pages["filename"]] = pages

out["motm"] = data["motm"]
out["goto_adviser"] = data["goto_adviser"]



with open(outputfile,"w") as f:
    json.dump(out,f)