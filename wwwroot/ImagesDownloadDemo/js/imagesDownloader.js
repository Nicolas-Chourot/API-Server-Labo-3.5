/////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Author: Nicolas Chourot
// october 2022
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This script generate necessary html control in order to offer an image uploader.
// Also it include validation rules to avoid submission on empty file and excessive image size.
// 
// This script is dependant of jquery and jquery validation.
//
//  Any <div> written as follow will contain an image file uploader :
//
//  <div class='imageUploader' id='data_Id' controlId = 'controlId' imageSrc='image url'> </div>
//  <span class="field-validation-valid text-danger" data-valmsg-for="controlId" data-valmsg-replace="true"></span>
//
//  If data_Id = 0 the file not empty validation rule will be applied
//
//  Example:
//
//  With the following:
//  <div class='imageUploader' id='0' controlId='PhotoImageData' imageSrc='/Photos/No_image.png' waitingImage="/PhotosManager/Photos/Loading_icon.gif"> </div>
//  <span class="field-validation-valid text-danger" data-valmsg-for="PhotoImageData" data-valmsg-replace="true"></span>
//
//
//  We obtain:
//  <div class="imageUploader"
//       controlid="PhotoImageData"
//       imagesrc="/Photos/No_image.png" 
//       waitingImage = "/PhotosManager/Photos/Loading_icon.gif" >
//
//      <!-- Image uploaded -->
//      <img id="PhotoImageData_UploadedImage"
//           name="PhotoImageData_UploadedImage"
//           class="UploadedImage"
//           src="/Photos/No_image.png">
//
//      <!-- hidden file uploader -->
//      <input id="PhotoImageData_ImageUploader"
//             type="file"
//             style="visibility:hidden; height:0px;"
//             accept="image/jpeg,image/gif,image/png,image/bmp">
//  
//      <!-- hidden input uploaded imageData container -->
//      <input style="visibility:hidden;height:0px;"
//             class="fileUploadedExistRule fileUploadedSizeRule input-validation-error"
//             id="PhotoImageData"
//             name="PhotoImageData"
//             waitingImage="/PhotosManager/Photos/Loading_icon.gif">
//  </div>
//  <span class="field-validation-valid text-danger" data-valmsg-for="PhotoImageData" data-valmsg-replace="true"></span>
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////


// Error messages
//let missingFileErrorMessage = "You must select an image file.";
//let tooBigFileErrorMessage = "Image too big! Please choose another one.";
//let wrongFileFormatMessage = "It is not a valid image file. Please choose another one.";
let missingFileErrorMessage = "Veuillez sélectionner une image.";
let tooBigFileErrorMessage = "L'image est trop volumineuse.";
let wrongFileFormatMessage = "Ce format d'image n'est pas accepté.";

let maxImageSize = 15000000;
var currentId = 0;

// Accepted file formats
let acceptedFileFormat = "image/jpeg,image/jpg,image/gif,image/png,image/bmp,image/webp";

$(() => {
    /* you can have more than one file uploader */
    $('.imageUploader').each(function () {
        initImageUploader($(this));
        $(".UploadedImage").on('dragenter', function (e) {
            $(this).css('border', '2px solid blue');
        });

        $(".UploadedImage").on('dragover', function (e) {
            $(this).css('border', '2px solid blue');
            e.preventDefault();
        });

        $(".UploadedImage").on('dragleave', function (e) {
            $(this).css('border', '2px solid white');
            e.preventDefault();
        });
    });

    $(".UploadedImage").on('drop', (e) => { uploadDroppedImageFile(e) });
});

function initImageUploader(imageUploader) {
    let controlId = imageUploader.attr('controlId');
    let waitingImage = imageUploader.attr('waitingImage');
    let defaultImage = imageUploader.attr('imageSrc');

    let imageContainer = $('<div class="UploadedImage" >');
    imageContainer.attr("id", `${controlId}_UploadedImage`);
    imageContainer.attr("name", `${controlId}_UploadedImage`);
    imageContainer.attr("waitingImage", waitingImage);
    setBackgroundImage(imageContainer, defaultImage);

    let inputFileControl = $('<input type="file" style="visibility:hidden; height:0px;">');
    inputFileControl.attr("id", `${controlId}_ImageUploader`);
    inputFileControl.attr("accept", acceptedFileFormat);

    let imageDataContainer = $('<input style="visibility:hidden;height:0px;">');
    imageDataContainer.attr("id", controlId);
    imageDataContainer.attr("name", controlId);

    imageUploader.append(imageContainer);
    imageUploader.append(inputFileControl);
    imageUploader.append(imageDataContainer);

    // one click will be transmitted to #controlId_ImageUploader
    imageContainer.click(() => { inputFileControl.trigger('click') });
    imageUploader.on('change', (e) => { uploadInputImageFile(e) });
}
function setBackgroundImage(target, url) {
    if (url) {
        target.css("background-image", `url('${url}')`);
        target.css("background-position", "center");
        target.css("background-size", "contain");
        target.css("background-repeat", "no-repeat");
        target.css("background-color", "gray");
    }
}
function getBackgroundImage(target) {
    return target.css("background-image").replace(/^url\(['"](.+)['"]\)/, '$1');
}
function validExtension(ext) {
    return acceptedFileFormat.indexOf("/" + ext) > 0;
}
function loadDroppedImageFile(imageFile, imageContainer, previousImage) {
    let imageData = "";
    setTimeout(function () {
        if (imageContainer) {
            if (imageFile.name.length > maxImageSize) {
                alert(tooBigFileErrorMessage);
                setBackgroundImage(imageContainer, previousImage);
            }
            else {
                if (imageFile.name.length !== 0) {
                    let imageFileExtension = imageFile.name.split('.').pop().toLowerCase();
                    if (!validExtension(imageFileExtension)) {
                        alert(wrongFileFormatMessage);
                        setBackgroundImage(imageContainer, previousImage);
                    }
                    else {
                        let fileReader = new FileReader();
                        fileReader.readAsDataURL(imageFile);
                        fileReader.onloadend = () => {
                            let base64ImageData = fileReader.result;
                            setBackgroundImage(imageContainer, base64ImageData);
                            imageData = base64ImageData;
                        };
                    }
                }
                else {
                    setBackgroundImage(imageContainer, previousImage);
                }
            }
        }
    }, 30);
    return imageData;
}
function loadInputImageFile(imageUploader, imageContainer, previousImage) {
    let imageData = "";
    imageUploader = imageUploader[0];// jquery to DOM
    setTimeout(function () {
        if (imageUploader) {
            if (imageUploader.value.length !== 0) {
                if (!validExtension(imageUploader.value.split('.').pop().toLowerCase())) {
                    alert(wrongFileFormatMessage);
                    setBackgroundImage(imageContainer, previousImage);
                }
                else {
                    let fileReader = new FileReader();
                    fileReader.readAsDataURL(imageUploader.files[0]);
                    fileReader.onloadend = () => {
                        let base64ImageData = fileReader.result;
                        setBackgroundImage(imageContainer, base64ImageData);
                        imageData = base64ImageData;
                    };
                }
            }
            else {
                setBackgroundImage(imageContainer, previousImage);
            }
        }
    }, 30);
    return imageData;
}
function getImageContainer(controlId) {
    let imageContainer = $(`#${controlId}_UploadedImage`);
    setBackgroundImage(imageContainer, imageContainer.attr("waitingImage"));
    return imageContainer;
}

function uploadDroppedImageFile(event) {
    let droppedImageFile = event.originalEvent.dataTransfer.files[0];
    let controlId = event.target.id.split('_')[0];
    let imageContainer = getImageContainer(controlId);
    let imageData = $('#' + controlId);
    let previousImage = getBackgroundImage(imageContainer);
    imageData.val(loadDroppedImageFile(droppedImageFile, imageContainer, previousImage));
    $(this).css('border', '2px solid white');
    event.preventDefault();
    return true;
}
function uploadInputImageFile(event) {
    // extract the id of the event target
    let controlId = event.target.id.split('_')[0];
    let ImageUploader = $(`#${controlId}_ImageUploader`);
    let imageContainer = getImageContainer(controlId);
    let imageData = $('#' + controlId);
    let previousImage = getBackgroundImage(imageContainer);;
    imageData.val(loadInputImageFile(ImageUploader, imageContainer, previousImage));
    return true;
}

function clearImageData(id) {
    document.querySelector('#' + id).value = "";
}
function getImageData(id) {
    return document.querySelector('#' + id).value;
}
function setImageData(id, value) {
    document.querySelector('#' + id).value = value;
}
function setImageDownloaderBlankImage(id) {
    $(`#${id}_UploadedImage`).attr("src", "images/No_Image.png");
}
function setImageDownloaderImage(id, url) {
    $(`#${id}_UploadedImage`).attr("src", url);
}


document.onpaste = function (event) {
    let id = event.target.id.split('_')[0];
    let UploadedImage = document.querySelector('#' + id + '_UploadedImage');
    let ImageData = document.querySelector('#' + id);
    let waitingImage = UploadedImage.getAttribute("waitingImage");
    if (waitingImage !== "") UploadedImage.src = waitingImage;
    // use event.originalEvent.clipboard for newer chrome versions
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    // find pasted image among pasted items
    var blob = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
        }
    }
    // load image if there is a pasted image
    if (blob !== null) {
        var reader = new FileReader();
        reader.onload = function (event) {
            UploadedImage.src = event.target.result;
            ImageData.value = UploadedImage.src;
        };
        reader.readAsDataURL(blob);
    }
}

//https://soshace.com/the-ultimate-guide-to-drag-and-drop-image-uploading-with-pure-javascript/ 