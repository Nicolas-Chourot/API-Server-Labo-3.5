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
//  <div class='imageUploader'
//       controlId='PhotoImageData'
//       imageSrc='Photos/No_image.png'
//       waitingImage="PhotosManager/Photos/Loading_icon.gif"> </div>
//
//
//  We obtain:
//  <div class="imageUploader"
//       controlid="PhotoImageData"
//       defaultImage="Photos/No_image.png"
//       waitingImage = "PhotosManager/Photos/Loading_icon.gif" >
//
//      <!-- Image uploaded -->
//      <div id="PhotoImageData_imageContainer"
//           name="PhotoImageData_imageContainer"
//           class="UploadedImage"
//           style="background-image:url('Photos/No_image.png')"></div>
//
//      <!-- hidden file uploader -->
//      <input id="PhotoImageData_ImageUploader"
//             type="file"
//             style="visibility:hidden; height:0px;"
//             accept="image/jpeg,image/gif,image/png,image/bmp">
//
//      <!-- hidden input uploaded imageData container -->
//      <input style="visibility:hidden;height:0px;"
//             id="PhotoImageData"
//             name="PhotoImageData">
//  </div>
//  <span class="field-validation-valid text-danger" data-valmsg-for="PhotoImageData" data-valmsg-replace="true"></span>
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    <div 
        class="imageUploader" 
        id="photo"
        imagesrc="images/No_Image.png" 
        waitingimage="images/writing.gif">
        <div class="UploadedImage" 
            id="photo_imageContainer" 
            style= "background-image: url(&quot;images/No_Image.png&quot;); 
                    background-position: center center; 
                    background-size: contain; 
                    background-repeat: no-repeat; 
                    width: 100%; 
                    height: 100%;">
        </div>
        <input 
            type="file" 
            style="visibility:hidden; height:0px;" 
            id="photo_ImageUploader" 
            accept="image/jpeg,image/jpg,image/gif,image/png,image/bmp,image/webp">
        <input 
            style="visibility:hidden; height:0px;" 
            id="photo_Data" 
            name="photo_Data">
    </div>


*/    // Error messages
let wrongFileFormatMessage = "Ce format d'image n'est pas accepté.";

// Accepted file formats
let acceptedFileFormat = "image/jpeg, image/jpg, image/gif, image/png, image/bmp, image/webp";

$(() => {
    /* you can have more than one file uploader */
    $(".ImageUploader").each(function () {
        initImageUploader($(this));
    });
    $(".ImageContainer").on("dragenter", function (e) {
        $(this).css("border", "4px solid blue");
        e.preventDefault();
    });
    $(".ImageContainer").on("dragover", function (e) {
        e.preventDefault();
    });
    $(".ImageContainer").on("dragleave", function (e) {
        $(this).css("border", "4px solid white");
        e.preventDefault();
    });
    $(".ImageContainer").on("drop", (e) => {
        uploadDroppedImageFile(e);
    });
});
function clearImageData(id) {
    $("#" + id).val("");
}
function getImageData(id) {
    return $(`#${id}_Data`).val();
}
function setImageData(id, value) {
    console.log(value)
    $(`#${id}_Data`).val(value);
}
function getWaitingImage(id) {
    return $(`#${id}`).attr("waitingImage");
}
function getImage(id) {
    let target = $(`#${id}_ImageContainer`);
    return target.css("background-image").replace(/^url\(['"](.+)['"]\)/, "$1");
}
function resetImage(id) {
    let target = $(`#${id}_ImageContainer`);
    setBackgroundImage(id, target.attr("defaultImage"));
}
function setImage(id, url) {
    let target = $(`#${id}_ImageContainer`);
    if (url) {
        target.css("flex", "100%");
        target.css("height", "100%");
        target.css("width", "100%");
        target.css("background-image", `url('${url}')`);
        target.css("background-position", "center");
        target.css("background-size", "contain");
        target.css("background-repeat", "no-repeat");
    }
}
function initImageUploader(imageUploader) {
    let id = imageUploader.attr("id");
    imageUploader.css("display", "flex");
    imageUploader.css("flex-direction", "column");
    imageUploader.css("align-items", "center");
    imageUploader.css("padding-top", "6px");
    imageUploader.css("padding-left", "8px");
    imageUploader.css("padding-right", "8px");
    
    let imageContainer = $(`<div class="ImageContainer" id="${id}_ImageContainer">`);
    imageUploader.append(imageContainer);

    setImage(id, imageUploader.attr("defaultImage"));

    let inputFileControl = $('<input type="file" style="visibility:hidden; height:0px;">');
    imageUploader.append(inputFileControl);
    inputFileControl.attr("id", `${id}_ImageUploader`);
    inputFileControl.attr("accept", acceptedFileFormat);

    let imageDataContainer = $(`<input id=${id}_Data style="visibility:hidden; height:0px;">`);
    imageUploader.append(imageDataContainer);

    // one click will be transmitted to #id_ImageUploader
    imageContainer.click(() => {
        inputFileControl.trigger("click");
    });
    imageUploader.on("change", (e) => {
        uploadInputImageFile(e);
    });
}
function validExtension(ext) {
    return acceptedFileFormat.indexOf("/" + ext) > 0;
}
function uploadDroppedImageFile(event) {
    let droppedImageFile = event.originalEvent.dataTransfer.files[0];
    let id = event.target.id.split("_")[0];
    let previousImage = getImage(id);
    setImage(id, getWaitingImage(id));
    let imageFileExtension = droppedImageFile.name.split(".").pop().toLowerCase();
    if (!validExtension(imageFileExtension)) {
        alert(wrongFileFormatMessage);
        setImage(id, previousImage);
    } else {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(droppedImageFile);
        fileReader.onloadend = () => {
            let base64ImageData = fileReader.result;
            setImage(id, base64ImageData);
            setImageData(id, base64ImageData);
        };
    }
    $(`#${id}_ImageContainer`).css("border", "0px solid white");
    event.preventDefault();
    return true;
}
function uploadInputImageFile(event) {
    let id = event.target.id.split("_")[0];
    let imageUploader = $(`#${id}_ImageUploader`)[0]; // jquery to DOM
    let previousImage = getImage(id);
    setImage(id, getWaitingImage(id));
    if (!validExtension(imageUploader.value.split(".").pop().toLowerCase())) {
        alert(wrongFileFormatMessage);
        setImage(id, previousImage);
    } else {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(imageUploader.files[0]);
        fileReader.onloadend = () => {
            let base64ImageData = fileReader.result;
            setImage(id, base64ImageData);
            setImageData(id, base64ImageData);
        };
    }
    return true;
}
