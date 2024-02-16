
## FormatD.HotspotContent

This package provides an image content element with hotspots. The neos editor can create and drag hotspots on the image and provide labels and other description.
It could also be used to put hotspots on any content (not only images) by copying `FormatD.HotspotContent:Content.ImageWithHotspots` prototype and replacing `renderer.content` with another content.

### Compatibility

Versioning scheme:

     1.0.0 
     | | |
     | | Bugfix Releases (non breaking)
     | Neos Compatibility Releases (non breaking)
     Feature Releases (breaking)

Releases and compatibility:

| Package-Version | Neos CMS Version |
|-----------------|------------------|
| 1.0.x           | 8.x and newer    |

### Screenshots

tbd.

### JS and CSS

If you have a global asset bundeling in place then it probably makes sense to disable the JS and CSS auto includes and import the Root.css and Root.ts files.

```
FormatD:
  HotspotContent:
    includeJS: false
    includeCSS: false
```


This package uses https://github.com/Format-D/FormatD.ComponentLoader to load, initialize (and re-initialize) JS on demand in the backend and frontend.





