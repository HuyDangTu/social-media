import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import faImages from '@fortawesome/fontawesome-free-solid/faImages';
import faTimesCircle from '@fortawesome/fontawesome-free-solid/faTimesCircle';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

class FileUpload extends Component {
    
    constructor(){
        super()
        this.state = {
            uploadedFiles:[],
            uploadedImages: [],
            uploading: false,
            imageTest: "",   
        }
    }

    updateImageList = (image) => {
        console.log(image)
        this.setState({
            uploadedImages: [
                ...this.state.uploadedImages,
                image
            ]
        },()=>{
            this.props.imagesHandler(this.state.uploadedImages)
        })
    }

    readFile(file, callback) {
        var reader = new FileReader();
        var baseString;
        reader.onloadend = function () {
            baseString = reader.result;
            callback(baseString);
        };
        reader.readAsDataURL(file);
    }

    onDrop = async (files) =>{
        console.log('files',files)
        this.setState({uploading: true});
        let formData = new FormData();
        const config = {
            header: {'content-type':'multipart/form-data'}
        }
        formData.append("file",files[0]);
        this.setState({
            uploading: false,
            uploadedFiles: [
                ...this.state.uploadedFiles,
                URL.createObjectURL(files[0])
            ]
        })
        
        this.readFile(files[0],(image)=>this.updateImageList(image))
    }

    onRemove = (id) =>{
        this.setState({ uploading: true });
        axios.get(`/api/users/removeimage?public_id=${id}`)
        .then(response =>{
            let images = this.state.uploadedFiles.filter(item => {
                return item.public_id !== id;
            });
            this.setState({
                uploading: false,
                uploadedFiles: images
            },()=>{
                this.props.imagesHandler(images)
            })
        })
    }

    showUploadImages = () => (
        this.state.uploadedFiles.map((item,index) => (
            <div className='dropzone_UploadedImg_wrapper'
                key={index} >
                <FontAwesomeIcon className="delete_image_icon" onClick={() => this.onRemove(item.public_id)}
                    icon={faTimesCircle} />
                <div className='uploaded_img'>
                    <img className="uploaded_img" src={item} alt="photo"/>
                </div>
            </div>
        ))
    )

    static getDirevedStateFromProps(props,state){
        if(props.reset){
            return state = { uploadedFiles: []}
        }
        return null;
    }

    render() {
        return (
            <div className='dropzone clear'>
            <div className="dropzone_wrapper">
            
                <Dropzone 
                onDrop={(e) => this.onDrop(e)}
                multiple={false}>
                    {({ getRootProps, getInputProps }) => (
                    <section>
                        <div {...getRootProps()} className="dropzone_container">
                            <input {...getInputProps()} />
                            <div {...getRootProps} className='dropzone_Add_button'>
                                <FontAwesomeIcon
                                    icon={faImages} />
                            </div>
                        </div>
                    </section>
                )}
                </Dropzone>
                {
                this.state.uploading ?
                    <div className='process_bar'>
                        <LinearProgress />
                    </div>
                : null
                }
           
            </div>
                <div className="uploaded_image_display">
                {
                    this.showUploadImages()
                } 
                </div>
            </div>
        );
    }
}

export default FileUpload;