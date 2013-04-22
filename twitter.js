$(function(){

  var hashFilters = null;
  var Tweet = Backbone.Model.extend({
    
    hasHash : function(filterText){
        return _.contains(_.pluck(this.get('entities').hashtags,'text'), filterText);
    }
  });
  
  var Tweets = Backbone.Collection.extend({

    model: Tweet,
    
    initialize: function() {
    
      //todo: get from storage
      this.screenName = 'Cmdr_Hadfield';
      this.tweetCount = 200;
    },
    
    comparator: 'id_str',
    
    getDelta : false,
    
    url: function(){
      console.log('delta', this.getDelta);
      
      return "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=false"
      +"&screen_name="+this.screenName
      +"&count="+this.tweetCount
      
      //if we're refreshing from the server only fetch new tweets
      +(this.getDelta
       ? "&since_id="+this.getMaxId()
       : "")
      
      //This enables the cross-domain request, alternately declare jsonp on the XMLHttpRequest object
      +"&callback=?"
    },
    
    getMaxId: function(){
      return (_.max(this.models, function(tweet){ return tweet.get('id_str')})).get('id');
    }    
  });

  var TwitterFeed = new Tweets();

  // The DOM element for a tweet...
  var TweetView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#tweet-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    
    // Re-render the titles of the stream.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
    }
    
  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#twitterapp"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #hash-filter":  "filterOnEnter",
      "keypress #twitter-user":  "changeTwitterUser",
      "click #fetch-feed": "fetchFeed"
    },

    initialize: function() {
      this.inputUser = this.$("#twitter-user");
      this.inputHash = this.$("#hash-filter");
      this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(TwitterFeed, 'add', this.addOne);
      this.listenTo(TwitterFeed, 'reset', this.addAll);
      this.listenTo(TwitterFeed, 'all', this.render);
      this.listenTo(TwitterFeed, 'change', function(){console.log('fetched!');});

      this.footer = this.$('footer');
      this.main = $('#main');
      TwitterFeed.getDelta = false;
      TwitterFeed.fetch({ success: function(collection, response, options) {
                            console.log('success!', collection, response, options);
                          },
                          error: function(collection, response, options) {
                                      console.log('error:(', collection, response, options);
                          }        
        });     
    },

    render: function() {
    },
    
    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(tweet) {
      var view = new TweetView({model: tweet});
      this.$("#tweets").append(view.render().el);
    },
    
    // Add a stream
    addAll: function() {
      TwitterFeed.each(this.addOne, this);
    },
    
    filterOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.inputHash.val()) return;
      
      var filterText = this.inputHash.val();
        
        //todo: this is buggy and erratic
      _.each(TwitterFeed.models, function(tweet, index, list){

        if(!tweet.hasHash(filterText)){
          TwitterFeed.remove(tweet)
        }
        
      });

      $("#tweets")[0].innerHTML = ''
      App.addAll();

      this.inputHash.val('');
    },
    
    changeTwitterUser:function(e) {
      if (e.keyCode != 13) return;
      if (!this.inputUser.val()) return;
      
      var filterText = this.inputUser.val();
      
      TwitterFeed.screenName = this.inputUser.val();
      TwitterFeed.getDelta = false;
      $("#tweets")[0].innerHTML = '';
      TwitterFeed.fetch();
      this.inputUser.val('');
    },
    
    fetchFeed : function(){
      TwitterFeed.getDelta = true;
      try{
        TwitterFeed.fetch();
      }
      catch(e){
        console.log('Encountered an error refreshing data.', e);
      }
    }
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});

