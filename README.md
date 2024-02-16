
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

| Package-Version | Neos CMS Version  | Notes                                                                       |
|-----------------|-------------------|-----------------------------------------------------------------------------|
| 2.0.x           | >= 8.3 < 9        | There is no Version 1.0 to be matching with formatd/hotspot-editor versions |


### Screenshots

tbd.


### JS and CSS

If you have a global asset bundeling in place then it probably makes sense to disable the JS and CSS auto includes and import the Root.ts files.

```
FormatD:
  HotspotContent:
    includeJS: false
    includeCSS: false
```

This package uses `formatd/componentloader` (https://github.com/Format-D/FormatD.ComponentLoader) to load, initialize (and re-initialize) JS on demand in the backend and frontend.
If you want to use the component loader for more then this package also just disable the JS and CSS includes and import Root.ts yourself.


### Extensibility and Customization

This package is based on `formatd/hotspot-editor` (https://github.com/Format-D/FormatD.HotspotEditor) and provides a concrete implementation.
Instead of using this package directly, it could aso make sense to use it as an example how to build your own hotspot elements in neos.


### Roadmap

- Offclick close for layer

