global.jQuery = require('jQuery');
var $ = global.jQuery;
var base64 = require('base-64');

import Renderer from "./Renderer.js";
import Doc from "./Doc.js";
import Recent from "./Recent.js";
import Repo from "./Repo.js";

var access_token = window.location.hash.substring(7);
var ace = require('brace');

var aceEditor;
var Util = {
  // no idea why these are not working
  undarken: function(){
    $('#editor').removeClass("darkened");
    $('#preview').removeClass("darkened");
  },
  // no idea why these are not working
  darken: function(){
    console.log($("#preview"));
    $('#editor').removeClass("darkened");
    $('#preview').removeClass("darkened");
  },
  access_token: access_token,
  retrieveAPIData: function(url, access_token){
    var url_with_access = url.includes("?") ? url + "&access_token=" + access_token : url + "?access_token=" + access_token;
    return $.get(url_with_access);
  },
  parseXMLContent: function(data){
    var content = base64.decode(data.content);
    return content;
  },
  addXMLContent: function(content){
    aceEditor = ace.edit("editor");
    aceEditor.setValue(content);
    aceEditor.clearSelection();
    aceEditor.gotoLine(0);
    aceEditor.scrollToLine(0);
  },
  createPreviewContent: function(content){
    var newText = Renderer.tei_conversion(content, function(data){});
    $("#preview").html(newText);
  },
  setSaveParameters: function(data){
    var branch = data.url.split("?ref=")[1]
    var repo = data.repo ? data.repo : data.url.split("https://api.github.com/repos/")[1].split("/contents/")[0];
    var path = data.path.split("/" + data.name)[0] === data.name ? "" : data.path.split("/" + data.name)[0];
    $("#sha").val(data.sha);
    $("#save-url").html(data.url);
    $("#repo").val(repo);
    $("#path").val(path);
    $("#file-name").val(data.name);
    $("#branch").val(branch);
    $('#message').val("");

    Doc.set(data)
    Repo.retrieveAndSetRepoState("https://api.github.com/repos/" + repo, Util.access_token)
  },
  clearSaveParameters: function(){
    $("#sha").val("");
    $("#save-url").html("");
    $("#repo").val("");
    $("#path").val("");
    $("#file-name").val("");
    $("#branch").val("");
    $('#message').val("");

    Doc.set(null);
    Repo.set(null);
  },
  loadText: function(url, access_token){
    var _this = this;
    _this.retrieveAPIData(url, access_token).done(function(data){
      var content = Util.parseXMLContent(data);
      _this.addXMLContent(content);
      _this.createPreviewContent(content);
      _this.setSaveParameters(data);
    });
  },
  loadTemplateText: function(){
    var _this = this;
    var content = [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?\n',
      '<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_lite.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>\n',
      '<TEI xmlns="http://www.tei-c.org/ns/1.0">\n',
      '  <teiHeader>\n',
      '    <fileDesc>\n',
      '      <titleStmt>\n',
      '        <title>Title</title>\n',
      '      </titleStmt>\n',
      '      <publicationStmt>\n',
      '        <p>Publication information</p>\n',
      '      </publicationStmt>\n',
      '      <sourceDesc>\n',
      '        <p>Information about the source</p>\n',
      '      </sourceDesc>\n',
      '    </fileDesc>\n',
      '  </teiHeader>\n',
      '  <text>\n',
      '    <body>\n',
      '      <p>Some text here.</p>\n',
      '    </body>\n',
      '  </text>\n',
      '</TEI>'].join('');

      Util.clearSaveParameters();
      _this.addXMLContent(content);
      _this.createPreviewContent(content);

  }
}

export default Util;