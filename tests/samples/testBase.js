"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleComponent = exports.getParameters = exports.getCounter = void 0;
var counter = {
    ctor: 0,
    init: 0,
    updateView: 0,
    destroy: 0,
    getOutputs: 0
};
var parameters = {};
var getCounter = function () { return (__assign({}, counter)); };
exports.getCounter = getCounter;
var getParameters = function () { return (__assign({}, parameters)); };
exports.getParameters = getParameters;
var currentScript = document.currentScript;
var SampleComponent = /** @class */ (function () {
    /**
     * Empty constructor.
     */
    function SampleComponent() {
        if (window.pcfReloadParams) {
            var params = window.pcfReloadParams;
            this.init(params.context, params.notifyOutputChanged, params.state, params.container);
            this.updateView(params.context);
        }
        counter.ctor++;
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    SampleComponent.prototype.init = function (context, notifyOutputChanged, state, container) {
        this.listenToWSUpdates({
            context: context,
            notifyOutputChanged: notifyOutputChanged,
            state: state,
            container: container
        });
        counter.init++;
        parameters.context = context;
        parameters.notifyOutputChanged = notifyOutputChanged;
        parameters.state = state;
        parameters.container = container;
    };
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    SampleComponent.prototype.updateView = function (context) {
        if (window.pcfReloadParams)
            window.pcfReloadParams.context = context;
        counter.updateView++;
        parameters.updateContext = context;
    };
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    SampleComponent.prototype.getOutputs = function () {
        counter.getOutputs++;
        return {};
    };
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    SampleComponent.prototype.destroy = function () {
        counter.destroy++;
    };
    SampleComponent.prototype.listenToWSUpdates = function (params) {
        var _this = this;
        window.pcfReloadParams = params;
        var address = "ws://127.0.0.1:8181/ws";
        this._reloadSocket = new WebSocket(address);
        this._reloadSocket.onmessage = function (msg) {
            if (msg.data != "reload" && msg.data != "refreshcss")
                return;
            _this.reloadComponent();
        };
        console.log("Live reload enabled on " + address);
    };
    SampleComponent.prototype.reloadComponent = function () {
        console.log("Reload triggered");
        this.destroy();
        if (this._reloadSocket) {
            this._reloadSocket.onmessage = null;
            this._reloadSocket.close();
        }
        var isScript = function (s) { return !!s.src; };
        if (!currentScript || !isScript(currentScript))
            return;
        var script = document.createElement("script");
        script.src = currentScript.src;
        var parent = currentScript.parentNode;
        if (!parent)
            return;
        currentScript.remove();
        parent.appendChild(script);
    };
    return SampleComponent;
}());
exports.SampleComponent = SampleComponent;
if (window.pcfReloadParams)
    new SampleComponent();
