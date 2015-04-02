jQuery.sap.require("demo.util.Controller");
jQuery.sap.require("demo.view.fragments.ProductForm");

demo.util.Controller
  .extend("ProductFormFragmentLogic", new demo.view.fragments.ProductForm())
  .extend("demo.view.AddProduct",
{
  oAlertDialog : null,
  oBusyDialog : null,

  onInit: function () {
    // set up the "newProduct" model on the page
    this.createNewProductModel();
  },

  showErrorAlert: function (sMessage) {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.alert(sMessage);
  },

  onCancel: function () {
    sap.ui.core.UIComponent.getRouterFor(this).backWithoutHash(this.getView());
  },

  saveProduct : function(nID) {
    var mNewProduct = this.getView().getModel("newProduct").getData().Detail;
    // Basic payload data
    var mPayload = {
      ID: nID,
      Name: mNewProduct.Name,
      Description: mNewProduct.Description,
      ReleaseDate: this.buildExpectedODataDateString(mNewProduct.ReleaseDate),
      Price: mNewProduct.Price.toString(),
      Rating: mNewProduct.Rating
    };

    if (mNewProduct.DiscontinuedDate) {
      mPayload.DiscontinuedDate = this.buildExpectedODataDateString(mNewProduct.DiscontinuedDate);
    }

    // Add supplier & category associations
    ["Supplier", "Category"].forEach(function(sRelation) {
      var oSelect = this.getView().byId("idSelect" + sRelation);
      var sPath = oSelect.getSelectedItem().getBindingContext().getPath();
      mPayload[sRelation] = {
        __metadata: {
          uri: sPath
        }
      };
    }, this);

    // Send OData Create request
    var oModel = this.getView().getModel();
    oModel.create("/Products", mPayload, {
      success : jQuery.proxy(function(mResponse) {
        this.createNewProductModel();
        sap.ui.core.UIComponent.getRouterFor(this).navTo("product", {
          id: mResponse.ID,
          tab: "supplier"
        }, false);

        // ID of newly inserted product is available in mResponse.ID
        this.oBusyDialog.close();
        sap.m.MessageToast.show("Product '" + mPayload.Name + "' added");
      }, this),
      error : jQuery.proxy(function() {
        this.oBusyDialog.close();
        this.showErrorAlert("Problem creating new product");
      }, this)
    });

  },

  onSave : function() {
    // Show message if no product name has been entered
    // Otherwise, get highest existing ID, and invoke create for new product
    if (!this.getView().getModel("newProduct").getProperty("/Detail/Name")) {
      if (!this.oAlertDialog) {
        this.oAlertDialog = sap.ui.xmlfragment("demo.view.fragments.NameRequiredDialog", this);
        this.getView().addDependent(this.oAlertDialog);
      }
      this.oAlertDialog.open();
    } else {
      if (!this.oBusyDialog) {
        this.oBusyDialog = new sap.m.BusyDialog();
      }
      this.oBusyDialog.open();
      this.getView().getModel().read("/Products", {
        urlParameters : {
          "$top" : 1,
          "$orderby" : "ID desc",
          "$select" : "ID"
        },
        success : jQuery.proxy(function(oData) {
          this.saveProduct(oData.results[0].ID + 1);
        }, this),
        error : jQuery.proxy(function() {
          this.oBusyDialog.close();
          this.showErrorAlert("Cannot determine next ID for new product");
        }, this)
      });
    }
  }

});