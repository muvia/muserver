(function(){Meteor.startup(function(){document.body.appendChild(Spark.render(Template.__define__(null,Package.handlebars.Handlebars.json_ast_to_func([["{",[[0,"loginButtons"],{"align":"right"}]],"<br>\n\t    <h1>Chatapp</h1>\n\t      ",[">","welcome"],"\n\t      ",[">","input"],"\n\t      ",[">","messages"]]))));});Template.__define__("welcome",Package.handlebars.Handlebars.json_ast_to_func(["<p>\n\t    Welcome to the example chat app! Please log in to show your username.\n\t </p>"]));
Template.__define__("messages",Package.handlebars.Handlebars.json_ast_to_func([["#",[[0,"each"],[0,"messages"]],["\n\t       <strong>",["{",[[0,"name"]]],"</strong> ",["{",[[0,"message"]]],"<br>\n\t\t     "]]]));
Template.__define__("input",Package.handlebars.Handlebars.json_ast_to_func(["<p>Message: <input type=\"text\" id=\"message\"></p>"]));

})();
