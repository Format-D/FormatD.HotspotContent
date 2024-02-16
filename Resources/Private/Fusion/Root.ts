
import './Root.scss';

import { componentLoader } from "@packages/Application/FormatD.ComponentLoader/Resources/Private/TypeScript/ComponentLoader";
componentLoader.addDefaultImport('FormatD.HotspotContent:Molecule.ContentWithHotspots', () => import('./Presentation/Molecule/ContentWithHotspots'));
componentLoader.initialize();
