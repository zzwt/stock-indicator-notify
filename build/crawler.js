"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarchartCrawler = void 0;
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
var codes_1 = __importDefault(require("./codes"));
var mail_1 = __importDefault(require("@sendgrid/mail"));
var Crawler = /** @class */ (function () {
    function Crawler() {
        this._codes = [];
        this._codes = codes_1.default;
    }
    Crawler.prototype.filterRSI = function (rsi) {
        if (rsi > 70 || rsi < 30)
            return rsi;
        return undefined;
    };
    Crawler.prototype.composeAlerts = function (alerts) {
        var text = '';
        Object.keys(alerts).map(function (code) {
            if (Object.keys(alerts[code]).length > 0) {
                text += code + ": <br>";
                Object.keys(alerts[code]).map(function (indicator) {
                    text += indicator + " : " + alerts[code][indicator] + " <br>";
                });
                text += '------------------------------------<br>';
            }
        });
        return text;
    };
    return Crawler;
}());
var BarchartCrawler = /** @class */ (function (_super) {
    __extends(BarchartCrawler, _super);
    function BarchartCrawler() {
        var _this = _super.call(this) || this;
        _this._codes = _this.codePreProcess(_this._codes);
        return _this;
    }
    BarchartCrawler.prototype.codePreProcess = function (codes) {
        return codes.map(function (code) { return (Number.parseInt(code[0]) ? "A-" + code : code); });
    };
    BarchartCrawler.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this._codes.map(function (code) { return __awaiter(_this, void 0, void 0, function () {
                            var rawHtml, indicators, value, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getRawHtml(code)];
                                    case 1:
                                        rawHtml = _a.sent();
                                        indicators = this.extractIndicators(rawHtml);
                                        value = [code, indicators];
                                        return [2 /*return*/, Promise.resolve(value)];
                                    case 2:
                                        error_1 = _a.sent();
                                        console.log("error processing code" + code);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })).then(function (values) {
                            var errorCount = 0;
                            var alerts = {};
                            values.map(function (value) {
                                if (value)
                                    alerts[value[0]] = value[1];
                                else
                                    errorCount += 1;
                            });
                            console.log("Error Code Count: " + errorCount);
                            _this.processIndicators(alerts);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BarchartCrawler.prototype.getRawHtml = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://www.barchart.com/stocks/quotes/" + code + ".AX/technical-analysis";
                        return [4 /*yield*/, axios_1.default.get(url, {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    BarchartCrawler.prototype.parseRSI = function (rawHtml) {
        var $ = cheerio_1.default.load(rawHtml);
        var indicators = $('.analysis-table-wrapper.bc-table-wrapper')
            .eq(2)
            .find('.even')
            .eq(0)
            .find('td')
            .eq(1);
        return Number.parseFloat(indicators.text().split('%')[0]);
    };
    BarchartCrawler.prototype.extractIndicators = function (rawHtml) {
        var results = {};
        var rsi = this.filterRSI(this.parseRSI(rawHtml));
        if (rsi)
            results['rsi'] = rsi;
        return results;
    };
    BarchartCrawler.prototype.processIndicators = function (alerts) {
        var text = this.composeAlerts(alerts);
        this.sendEmail(text);
    };
    BarchartCrawler.prototype.sendEmail = function (text) {
        if (process.env.SENDGRID_KEY) {
            mail_1.default.setApiKey(process.env.SENDGRID_KEY);
            var msg = {
                to: process.env.TO_EMAIL || '',
                from: process.env.FROM_EMAIL || '',
                subject: 'Daily Stock Indicators Alerts',
                text: 'hi there',
                html: text,
            };
            mail_1.default
                .send(msg)
                .then(function () {
                console.log('Email sent');
            })
                .catch(function (error) {
                console.error(error);
            });
        }
    };
    return BarchartCrawler;
}(Crawler));
exports.BarchartCrawler = BarchartCrawler;
