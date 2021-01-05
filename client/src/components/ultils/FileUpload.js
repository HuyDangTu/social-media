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
            uploading: false,   
        }
    }

    onDrop = (files) =>{
        console.log('files',files)
        this.setState({uploading: true});
        let formData = new FormData();
        const config = {
            header: {'content-type':'multipart/form-data'}
        }
        formData.append("file",files[0]);

        axios.post('/api/users/uploadimage',formData,config)
        .then(response => {
            this.setState({
                uploading: false,
                uploadedFiles: [
                    ...this.state.uploadedFiles,
                    response.data
                ]
            });
            console.log(this.state.uploadedFiles)
            this.props.imagesHandler(this.state.uploadedFiles)
        }, () => console.log(this.state.uploadedFiles),
            () => this.props.imagesHandler(this.state.uploadedFiles)
        )
        //console.log(this.state.uploadedFiles);
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
        this.state.uploadedFiles.map(item =>(
            <div className='dropzone_UploadedImg_wrapper'
                key={item.public_id} >
                <FontAwesomeIcon className="delete_image_icon" onClick={() => this.onRemove(item.public_id)}
                    icon={faTimesCircle} />
                <div className='uploaded_img'
                    style={{ backgroundImage: `url(${item.url}) `}}
                ></div>
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