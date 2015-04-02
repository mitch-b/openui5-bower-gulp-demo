jQuery.sap.declare("demo.Component");
jQuery.sap.require("demo.Router");

sap.ui.core.UIComponent.extend("demo.Component", {
  metadata: {
    name: "OpenUI5 Demo",
    includes: [],
    dependencies: {
      libs: ["sap.m", "sap.ui.layout"],
      components: []
    },
    rootView: "demo.view.App",
    config: {
      appConfig: "config.json", // config.json built with Gulp build:dev task
      resourceBundle: "i18n/messageBundle.properties"
    },
    routing: {
      config: {
        routerClass: demo.Router,
        viewType: "XML",
        viewPath: "demo.view",
        targetAggregation: "detailPages",
        clearTarget: false
      },
      routes: [
        {
          pattern: "",
          name: "main",
          view: "Master",
          targetAggregation: "masterPages",
          targetControl: "splitApp",
          subroutes: [
            {
              pattern: "product/{id}/:tab:",
              name: "product",
              view: "Detail",
              targetAggregation: "detailPages",
              viewLevel: 1
            }
          ]
        },
        {
          name: "catchallMaster",
          view: "Master",
          targetAggregation: "masterPages",
          targetControl: "splitApp",
          subroutes: [
            {
              pattern: ":all*:",
              name: "catchallDetail",
              view: "NotFound",
              transition: "show"
            }
          ]
        }
      ]
    }
  },

  init: function () {
    sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

    var mConfig = this.getMetadata().getConfig();

    // always use absolute paths relative to our own component
    // (relative paths will fail if running in the Fiori Launchpad)
    var oRootPath = jQuery.sap.getModulePath("demo");

    // set i18n model
    var i18nModel = new sap.ui.model.resource.ResourceModel({
      bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
    });
    this.setModel(i18nModel, "i18n");

    var appConfigModel = new sap.ui.model.json.JSONModel();
    appConfigModel.loadData(
      mConfig.appConfig, // path
      {}, // parameters
      false // async (false, we want to load right away)
    );
    this.setModel(appConfigModel, "appConfig");

    var oModel = new sap.ui.model.odata.ODataModel(
      appConfigModel.getData().eventService,
      {
        json: true,
        headers: {
          // remove this line if you are NOT using cors-anywhere
          "X-Requested-With": "OpenUI5"
        }
      }
    );
    oModel.setDefaultCountMode("None");
    this.setModel(oModel);

    // set device model (phone/desktop support)
    var deviceModel = new sap.ui.model.json.JSONModel({
      isTouch: sap.ui.Device.support.touch,
      isNoTouch: !sap.ui.Device.support.touch,
      isPhone: sap.ui.Device.system.phone,
      isNoPhone: !sap.ui.Device.system.phone,
      listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
      listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
    });

    deviceModel.setDefaultBindingMode("OneWay"); // only set once, then read-only
    this.setModel(deviceModel, "device");

    this.getRouter().initialize();
  }
});