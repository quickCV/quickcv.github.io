var app = angular.module("app", ["ngRoute", "firebase"]);

app
.controller('MainCtrl', function($scope, $routeParams){
      //$scope.msg = "Hello"
  })
.controller('CVCtrl', function($rootScope, $scope, $routeParams, $location, $firebaseObject, $anchorScroll){  
	 $scope.params = $routeParams;
    $scope._id = $scope.params._id;
    $scope.ref = firebase.database().ref();
    $scope.userRef = $scope.ref.child($scope._id);
    var obj = $firebaseObject($scope.userRef);
    obj.$loaded().then(function() {
        // To make the data available in the DOM, assign it to $scope
     $scope.user = obj;

     // For three-way data bindings, bind it to the scope instead
     obj.$bindTo($scope, "user");
     $rootScope.user = $scope.user; 
     var index = new google.maps.LatLng($scope.user.location.lat, $scope.user.location.lng);
     map.setCenter(index);
     marker.setPosition(index);
     });

    $scope.gotoAnchor = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      //reset to old to keep any additional routing logic from kicking in
      $location.hash(old);
    };

})
.config(function($routeProvider, $locationProvider){
        var config = {
        apiKey: "AIzaSyC8hcrGe0szT1j1okqaWwPNkI_631W6IL0",
        authDomain: "projectofkhang.firebaseapp.com",
        databaseURL: "https://projectofkhang.firebaseio.com",
        storageBucket: "projectofkhang.appspot.com",
        messagingSenderId: "154629377635"
      };
    firebase.initializeApp(config);

    $routeProvider
      .when('/cv_id/:_id',{
      	templateUrl : 'templates/CVTemplate.html',
        controller: 'CVCtrl'
    })
   })