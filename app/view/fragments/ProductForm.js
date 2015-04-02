jQuery.sap.require("demo.util.Controller");

demo.util.Controller
  .extend("demo.view.fragments.ProductForm",
  {

    onSave: function () {

      // i think it's better for the main views
      // to implement their own onSave() function
      // so that they can handle it their own way

    },

    onCancel: function () {

      // override this method in your implementation

    },

    /**
     * Convert a string Date using moment.js into proper
     * date format expected by OData endpoint
     * http://momentjs.com/docs/#/parsing/asp-net-json-date/
     * sDate : string
     */
    buildExpectedODataDateString: function (sDate) {
      if (!sDate) return null;
      return moment(sDate).toISOString(); // ISO8601 string
    },

    createNewProductModel: function () {
      this.getView().setModel(new sap.ui.model.json.JSONModel(), "newProduct");
      this.getView().getModel("newProduct").setData({
        Detail: {
          DiscontinuedFlag: false,
          Rating: 0
        }
      });
    }
  });