"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var dist_1 = require("@819/service-ts/dist");
var BizsolService = /** @class */ (function (_super) {
    __extends(BizsolService, _super);
    function BizsolService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BizsolService.prototype.resolveViewDirs = function () {
        var superViewDirs = _super.prototype.resolveViewDirs.call(this);
        var viewDirs = dist_1.Config.viewDir([[__dirname, '..', 'view/templates'].join('/')]);
        viewDirs = dist_1.Util.flatten(viewDirs.concat(superViewDirs));
        console.log("VIEWDIRS", viewDirs);
        return viewDirs;
    };
    return BizsolService;
}(dist_1.BaseService2));
exports.BizsolService = BizsolService;
