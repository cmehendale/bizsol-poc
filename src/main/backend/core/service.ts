import {BaseService2, Config, Util} from '@819/service-ts/dist/backend'
import * as path from 'path'

export class BizsolService extends BaseService2 {

    resolveViewDirs():string[] {
        const superViewDirs = super.resolveViewDirs()

        let viewDirs = Config.viewDir([[__dirname, '..', 'view/templates'].join('/')])
        viewDirs = Util.flatten(viewDirs.concat(superViewDirs))
        console.log("VIEWDIRS", viewDirs)
        return viewDirs
    }

    resolveTagDirs():string[] {
        const superTagDirs = super.resolveTagDirs()
        let tagDirs = Config.tagDir([path.normalize([__dirname, '..', '..', 'shared/tags'].join('/'))])
        tagDirs = Util.flatten(tagDirs.concat(superTagDirs))
        console.log("TAGDIRS", tagDirs)
        return tagDirs
    }

}