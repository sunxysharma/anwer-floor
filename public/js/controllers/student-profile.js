angular.module('mean.system').controller('StudentProfileController', ['$scope', '$http', '$state', '$uibModal', '$log', 'Global', '$ProfileService', '$SessionService', '$LocalService', function($scope, $http, $state, $uibModal, $log, Global, $ProfileService, $SessionService, $LocalService) {
    $scope.global = Global;
    $scope.animationsEnabled = true;
    $scope.user = {};
    var authUser = $SessionService.user();
    if (authUser.image != '' || authUser.image != undefined) {
        $scope.image = authUser.image;
    }

    $scope.UploadImage = function(event) {

        var image = new Image();
        var file = event.target.files[0];
        var myReader = new FileReader();
        myReader.onloadend = function(loadEvent) {
            image.src = loadEvent.target.result;

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'imageCropModal.html',
                controller: 'ProfileModalController',
                size: 'lg',
                resolve: {
                    items: function() {
                        return image.src;
                    }
                }
            });

            modalInstance.result.then(function(image) {
                $scope.image = image;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };

        myReader.readAsDataURL(file);
    }

    $scope.getProfileDetails = function() {
        $scope.authUser = $SessionService.user();
        console.log($scope.authUser);
        $ProfileService.get($scope.authUser.id, function(response) {
            if (response.result.length > 0) {
                $scope.userprofile = response.result[0];

                console.log($scope.userprofile, $scope.authUser);


                // var languages = response.result[0].Languages_known
                // var skills = response.result[0].skill
                // var interests = response.result[0].interests
                // var languages_known = JSON.parse(languages);
                // $scope.languages_known = JSON.parse(languages);
                // $scope.skill = JSON.parse(skills);
                // $scope.interests = JSON.parse(interests);
                // var str = ''
                // for (var i = 0; i < languages_known.length; i++) {
                //     var languages_known_string = ''
                //     var language = languages_known[i].text;
                //     languages_known_string = language + ' | ';
                // }
                // console.log('languages_known_string', languages_known_string)
            }
        });
    }

    $scope.getProfileDetails();


    $scope.Create = function(user) {
        var data = {};
        var authUser = $SessionService.user();
        data.UserId = authUser.id;
        data.category = user.category;
        data.education = user.education;
        data.location = user.location;
        data.interests = JSON.stringify(user.interests);
        data.Languages_known = JSON.stringify(user.languages);
        data.skill = JSON.stringify(user.skills);
        $ProfileService.createProfile(data, function(response) {
            authUser.image = $scope.image;
            $state.go("user.studentProfile");
        });
    }

    $scope.editProfile = function() {
        $state.go("user.editProfile");
    }

}]);


angular.module('mean.system').controller('ProfileModalController', ['$scope', '$window', '$uibModalInstance', 'items', '$ProfileService', '$SessionService', function($scope, $window, $uibModalInstance, items, $ProfileService, $SessionService) {
    $scope.myImage = items;
    $scope.myCroppedImage = '';

    $scope.dataURItoBlob = function(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var bb = new Blob([ab], { type: mimeString });
        return bb;
    }

    $scope.saveImage = function() {
        var authUser = $SessionService.user();
        var formData = new FormData();
        var image = $scope.dataURItoBlob($scope.myCroppedImage);
        formData.append("image", image);
        formData.append("id", authUser.id);
        $ProfileService.imageUpload(formData, function(response) {
            $uibModalInstance.close(response.filename);
        });

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };



}]);
