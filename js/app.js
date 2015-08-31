(function() {
    var app = angular.module("moviequotes", [ "ui.bootstrap", "modal-controllers", "firebase" ]);

    app.controller("MoviequotesCtrl", function($modal, $firebaseArray, $firebaseAuth) {
        this.navbarCollapsed = true;
        this.signedIn = false;
        var _this = this;
        //Done: Bind data to Firebase
        var moviequotesRef = new Firebase("https://fisherds-auth-movie-quotes.firebaseio.com/quotes");
        this.items = $firebaseArray(moviequotesRef);

        var compare = function(a, b) {
            return a.$id < b.$id;
        }
        this.items.$watch(function() { _this.items.sort(compare); });

        this.authDataCallback = function(authData) {
            if (authData) {
                console.log("User " + authData.uid + " is logged in with " + authData.provider);
                _this.uid = authData.uid;
                _this.signedIn = true;
            } else {
                console.log("User is logged out");
                _this.signedIn = false;
                _this.uid = "";
            }
        };
        this.auth = $firebaseAuth(moviequotesRef);
        this.auth.$onAuth(this.authDataCallback);

        this.showAddQuoteDialog = function(movieQuoteFromRow) {
            this.navbarCollapsed = true;
            var modalInstance = $modal.open({
                templateUrl : "/partials/addQuoteModal.html",
                controller : "AddQuoteModalCtrl",
                controllerAs : "insertModal"
            });
            modalInstance.result.then(function(movieQuoteFromModal) {
                //Done: Add movieQuote to Firebase
                console.log("Adding the uid");
                movieQuoteFromModal.uid = this.uid;
                _this.items.$add(movieQuoteFromModal);
                _this.isEditing = false;
            });
        };

        this.showUpdateQuoteDialog = function(movieQuoteFromRow) {
            this.navbarCollapsed = true;
            var modalInstance = $modal.open({
                templateUrl : "/partials/updateQuoteModal.html",
                controller : "UpdateQuoteModalCtrl",
                controllerAs : "insertModal",
                resolve : {
                    movieQuote : function() {
                        return {
                            get :
                            function() {
                                return movieQuoteFromRow;
                            },
                            save :
                            function(movieQuoteFromModal) {
                                //Done: save movieQuote to Firebase
                                _this.items.$save(movieQuoteFromModal);
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function() {
                _this.isEditing = false;
            });
        };

        this.showDeleteQuoteDialog = function(movieQuoteFromRow) {
            var modalInstance = $modal.open({
                templateUrl : "/partials/deleteQuoteModal.html",
                controller : "DeleteQuoteModalCtrl",
                controllerAs : "deleteModal",
                resolve : {
                    movieQuoteInModal : function() {
                        return movieQuoteFromRow;
                    }
                }
            });
            modalInstance.result.then(function(movieQuoteFromModal) {
                //Done: Delete the moviequote from Firebase
                _this.items.$remove(movieQuoteFromModal);
                _this.isEditing = false;
            });
        };

        this.showSignInDialog = function() {
            console.log("Sign in ");
            $modal.open({
                templateUrl : "/partials/signInModal.html",
                controller : "SignInModalCtrl",
                controllerAs : "signInModal",
                resolve : {
                    auth : function() {
                        return _this.auth;
                    }
                }
            });
        };

        this.signOut = function() {
            console.log("Sign out");
            this.auth.$unauth();
        };
    });
})();
