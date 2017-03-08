var app = angular.module("app", ["xeditable", "ui.bootstrap", "ngRoute", "firebase"]);

app.
run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
})
.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/login");
    }
  });
}]);

app
  .controller('MainCtrl', function($scope, $routeParams){
      //$scope.msg = "Hello"
  })
  .controller('SignupCtrl', function($scope, $firebaseAuth, $location){
    $scope.authObj = $firebaseAuth();
    var firebaseUser = $scope.authObj.$getAuth();
      if (firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        $location.path('/user_id/'+firebaseUser.uid);
      } else {
        console.log("Signed out");
      }
      $scope.doSignup = function(){
        if ($scope.password != $scope.confirm){
            $scope.msg = "The Passwords not match";
        }
        else{
          $scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
          .then(function(firebaseUser) {
            console.log("User " + firebaseUser.uid + " created successfully!");
            $location.path("/login");
          }).catch(function(error) {
            console.error("Error: ", error);
            $scope.msg = error.message;
          });
        }
      }
  })
  .controller('LogoutCtrl', ["Auth", "$scope", "$location" , function(Auth, $scope, $location){
    Auth.$signOut();
    $location.path("/login");
  }])
  .controller('LoginCtrl', function($scope, $firebaseAuth, $location){
    $scope.authObj = $firebaseAuth();
    var firebaseUser = $scope.authObj.$getAuth();
      if (firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        $location.path('/user_id/'+firebaseUser.uid);
      } else {
        console.log("Signed out");
      }
    
      $scope.doLogin = function(){
          $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        $location.path('/user_id/'+firebaseUser.uid);
      }).catch(function(error) {
        console.error("Authentication failed:", error);
        $scope.msg = "Wrong username or password!";
      });
      }
  })
  .controller('UserCtrl', function($scope, $routeParams, $firebaseArray, $firebaseObject, $http, $firebaseStorage, $location) {
    var handleFileSelect = function(evt) {
    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            var base64String =  btoa(binaryString);
            var uploadTask = $scope.storage.$putString(base64String, "base64", { contentType: "image/jgp" });
            uploadTask.$complete(function(snapshot) {
              console.log(snapshot.downloadURL);
              $scope.user.avatar_link = snapshot.downloadURL;
              alert("Done!");
            });
        };

        reader.readAsBinaryString(file);
    }
};
    var handleFileSelectPDF = function(evt) {
    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            var base64String =  btoa(binaryString);
            var uploadTask = $scope.storagePDF.$putString(base64String, "base64", { contentType: "application/pdf" });
            uploadTask.$complete(function(snapshot) {
              console.log(snapshot.downloadURL);
              $scope.user.cv_link = snapshot.downloadURL;
              alert("Done!");
            });
        };

        reader.readAsBinaryString(file);
    }
};
  var handleFileSelectCover = function(evt) {
    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            var base64String =  btoa(binaryString);
            var uploadTask = $scope.storageCover.$putString(base64String, "base64", { contentType: "image/jgp" });
            uploadTask.$complete(function(snapshot) {
              console.log(snapshot.downloadURL);
              $scope.user.cover_link = snapshot.downloadURL;
              alert("Done!");
            });
        };

        reader.readAsBinaryString(file);
    }
};
    $http.get("icon.json")
    .then(function(response) {
        $scope.icons = response.data;
    });
    $scope.params = $routeParams;
    $scope._id = $scope.params._id;
    $scope.baseURL = "https://" + $location.host()+"/" + 'cv/#!/cv_id/' + $scope._id;
    $scope.ref = firebase.database().ref();
    $scope.userRef = $scope.ref.child($scope._id);
    var obj = $firebaseObject($scope.userRef);
    var storageRef = firebase.storage().ref("avatar/"+$scope._id+".jpg");
    $scope.storage = $firebaseStorage(storageRef);
    var storageRefPDF = firebase.storage().ref("cvpdf/"+$scope._id+".pdf");
    $scope.storagePDF = $firebaseStorage(storageRefPDF);
    var storageRefCover = firebase.storage().ref("cover/"+$scope._id+".jpg");
    $scope.storageCover = $firebaseStorage(storageRefCover);
    obj.$loaded().then(function() {
        // To make the data available in the DOM, assign it to $scope
     $scope.user = obj;

     // For three-way data bindings, bind it to the scope instead
     obj.$bindTo($scope, "user");

     });
    //upload file
      if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('filePicker').addEventListener('change', handleFileSelect, false);
      } else {
          alert('The File APIs are not fully supported in this browser.');
      }
      if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('filePickerPDF').addEventListener('change', handleFileSelectPDF, false);
      } else {
          alert('The File APIs are not fully supported in this browser.');
      }
      if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('filePickerCover').addEventListener('change', handleFileSelectCover, false);
      } else {
          alert('The File APIs are not fully supported in this browser.');
      }
  // remove Speciality
  $scope.removeSpeciality = function(index) {
    $scope.user.specialities.splice(index, 1);
  };

  // add Speciality
    $scope.addSpeciality = function() {
      if (!$scope.user.specialities) $scope.user.specialities = [];
      $scope.inserted = {
        name: '',
        description: '',
        icon: '' 
      };
    $scope.user.specialities.push($scope.inserted);
  }; 
  // remove Language skills
  $scope.removeLanguageskills = function(index) {
    $scope.user.languageskills.splice(index, 1);
  };
  // add Language skills
  $scope.addLanguageskills = function() {
      if (!$scope.user.languageskills) $scope.user.languageskills = [];
      $scope.inserted = {
        name: '',
        percentage: 0
      };
    $scope.user.languageskills.push($scope.inserted);
  }; 
  // remove skillsandabilities
  $scope.removeSkillsAndAbilities = function(index) {
    $scope.user.skillsandabilities.splice(index, 1);
  };
  // add Language skills
  $scope.addSkillsAndAbilities = function() {
      if (!$scope.user.skillsandabilities) $scope.user.skillsandabilities = [];
      $scope.inserted = {
        name: '',
        percentage: 0
      };
    $scope.user.skillsandabilities.push($scope.inserted);
  }; 
  // remove education
  $scope.removeEducation = function(index) {
    $scope.user.education.splice(index, 1);
  };
  // add Education
  $scope.addEducation = function() {
      if (!$scope.user.education) $scope.user.education = [];
      $scope.inserted = {
        name: '',
        description: '',
        time: '' 
      };
    $scope.user.education.push($scope.inserted);
  }; 
  // remove hobbies
  $scope.removeHobbies = function(index) {
    $scope.user.hobbies.splice(index, 1);
  };
  // add hobbies
  $scope.addHobbies = function() {
      if (!$scope.user.hobbies) $scope.user.hobbies = [];
      $scope.inserted = {
        name: '',
        icon: ''
      };
    $scope.user.hobbies.push($scope.inserted);
  }; 
  // remove socialmedia
  $scope.removeSocialmedia = function(index) {
    $scope.user.socialmedia.splice(index, 1);
  };
  // add socialmedia
  $scope.addSocialmedia = function() {
      if (!$scope.user.socialmedia) $scope.user.socialmedia = [];
      $scope.inserted = {
        name: '',
        icon: ''
      };
    $scope.user.socialmedia.push($scope.inserted);
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
      .when('/user_id/:_id',{
        templateUrl: 'templates/UserTemplate.html',
        controller: 'UserCtrl',
         resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
      })
      .when('/login',{
        templateUrl: 'templates/LoginTemplate.html',
        controller: 'LoginCtrl'
      })
      .when('/logout',{
        templateUrl : 'templates/LogoutTemplate.html',
        controller: 'LogoutCtrl'
      })
      .when('/signup',{
        templateUrl: 'templates/SignupTemplate.html',
        controller : 'SignupCtrl'
      })
      .otherwise({
        redirectTo : "/login"
      });
  });
  app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);