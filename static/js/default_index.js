// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    function get_posts_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return posts_url + "?" + $.param(pp);
    }

    self.get_posts = function () {
        $.getJSON(get_posts_url(0, 10), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.email = data.email;
            enumerate(self.vue.posts);
        })
    };

    self.get_more = function () {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate(self.vue.posts);
        });
    };

    self.add_post_button = function () {
        // The button to add a track has been pressed.
        self.vue.is_adding_post = !self.vue.is_adding_post;
        
    };

    self.add_post = function (post_idx) {
        // The submit button to add a track has been added.
        $.post(add_post_url,
            {
                title: self.vue.form_title,
                postContent: self.vue.form_postContent,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
                enumerate(self.vue.posts);
                self.vue.form_title="";
                self.vue.form_postContent="";
                self.get_posts();
            });
        self.get_posts();
    };

    self.delete_post = function(post_idx) {
        $.post(del_post_url,
            { post_id: self.vue.posts[post_idx].id },
            function () {
                self.vue.posts.splice(post_idx, 1);
                enumerate(self.vue.posts);
            }
        )
    };

    self.toggle_public= function(post_idx){
            $.post(toggle_public_url,
                {post_id: self.vue.posts[post_idx].id},
                function(){
                    if(self.vue.posts[post_idx].is_public==false)
                        {self.vue.posts[post_idx].is_public=true;}
                    else
                        {self.vue.posts[post_idx].is_public=false;}
                }
            );
    };
    self.edit_post=function(post_idx){
        self.vue.is_editing_post=true;
        if(self.vue.is_adding_post != true){self.add_post_button();}
        self.vue.tempid=post_idx;
        self.vue.form_title=self.vue.posts[post_idx].title;
        self.vue.form_postContent=self.vue.posts[post_idx].postContent;    
    }
    self.finishEdit=function(){
        $.post(finish_edit_url,{
            title: self.vue.form_title,
            postContent: self.vue.form_postContent,
            post_id: self.vue.posts[self.vue.tempid].id
        },
        function(){
            self.vue.is_editing_post=false;
            self.vue.tempid=null;
            self.vue.is_adding_post=false;
            self.vue.form_postContent="";
            self.vue.form_title="";
        });
        
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_post: false,
            posts: [],
            logged_in: false,
            has_more: false,
            form_title: null,
            form_postContent: null,
            is_editing_post: false,
            tempid:null,
        },
        computed:{
            publicPosts: function(){
                return this.posts.filter(function(u){
                    return u.is_public
                })
            },
            myPosts: function(){
                return this.posts.filter(function (p){
                    return p.postEmail==self.vue.email;
                })
            }


        },
        methods: {
            get_more: self.get_more,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            delete_post: self.delete_post,
            toggle_public: self.toggle_public,
            edit_post: self.edit_post,
            finishEdit: self.finishEdit
            
        }

    });

    self.get_posts();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
