# PhiRIE project page

[Project page](https://insait-institute.github.io/PhiRIE/) · [This mirror](https://runyiyang.github.io/projects/PhiRIE/) · [Demo video](https://youtu.be/3-YdcBh6Tbw) · [PhiView code](https://github.com/RunyiYang/PhysicalView)

The page includes the overview video, PhiView demonstrations 01–09, a mass/friction
comparison, illustrated components, an image gallery, interactive playgrounds,
and a version tree with the release plan.

Editable source is in `_source/`. Use Node.js 22:

```bash
cd projects/PhiRIE/_source
npm ci
npm run dev
# http://127.0.0.1:5173/projects/PhiRIE/
npm run publish:pages
```

Commit source and generated files together. The existing GitHub Pages workflow
publishes the built project folder from the repository's `master` branch.
