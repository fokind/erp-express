/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/m/MessageToast',
], function(Controller, MessageToast) {
  return Controller.extend('tms.basic.controller.Login', {
    onInit: function() {
      let that = this;
      that.getView().setModel(new sap.ui.model.json.JSONModel());
    },

    onPressLogin: function() {
      let that = this;
      let oView = that.getView();
      let oModel = oView.getModel();
      let oResourceBundle = oView.getModel('i18n').getResourceBundle();

      $.post(
        {
          url: $.sap.formatMessage(
            '{0}Employees/login',
            that.getOwnerComponent()
              .getManifestEntry('/sap.app/dataSources/api/uri')
          ),
          data: $.sap.formatMessage(
            '\'{\'"username":"{0}","password":"{1}"\'}\'',
            [oModel.getProperty('/username'), oModel.getProperty('/password')]
          ),
          contentType: 'application/json',
        })
      .done(function(data, status, xhr) {
        window.localStorage.setItem('accessToken', data.id);
        MessageToast.show(oResourceBundle.getText('authSuccess'));
        that.onNavBack();
        // sap.ui.core.UIComponent.getRouterFor(oView).navTo('home');
      })
      .fail(function(data) {
        window.localStorage.removeItem('accessToken');
        MessageToast.show(oResourceBundle.getText('authError'));
      });
    },

    onPressLogout: function() {
      let that = this;
      let oView = that.getView();
      let oModel = oView.getModel();
      let oResourceBundle = oView.getModel('i18n').getResourceBundle();
      let oAccessToken = window.localStorage.getItem('accessToken');

      if (oAccessToken) {
        $.post({
          url: $.sap.formatMessage(
            '{0}Employees/logout',
            that.getOwnerComponent()
              .getManifestEntry('/sap.app/dataSources/api/uri')
          ),
          contentType: 'application/json',
          headers: {'Authorization': oAccessToken.id},
        });
        window.localStorage.removeItem('accessToken');
        MessageToast.show(oResourceBundle.getText('authLogoutSuccess'));
      }
    },

    onNavBack: function() {
      let that = this;
      let oHistory = sap.ui.core.routing.History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo('home', {}, true);
      }
    },
  });
});
