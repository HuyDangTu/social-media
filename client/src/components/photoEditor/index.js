import React from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import './photoEditor.scss';
const myTheme = {
  // Theme object to extends default dark theme.
};
// var pngUrl = canvas.toDataURL(); // PNG is the default

const uploadImage = async (uri) => {
    try{
        await fetch('api/upload',{
            method: 'POST',
            body: JSON.stringify({data: uri}),
            headers: {'Content-type': 'application/json'}
        });
    }catch (error){
        console.log(error)
    }
}


const PhotoEditor = () => {

    return (
        <div className="photoEditor">
            <div class="header">
                <div className="header-wrapper">
                    <button className="btn btn-cancel" onClick={()=>{
                            var list = document.getElementsByTagName("canvas")
                            var dataURL = list[0].toDataURL('image/jpeg', 1.0);
                            uploadImage(dataURL)
                        }}>Cancel</button>
                    <div className="header__logo" onClick={()=>{this.props.history.push('/newfeed')}}>
                        <img class="Logo_stunn"src={require('../../asset/logo/logo2x.png')} />
                        <img class="Logo_text" src={require('../../asset/logo/stunn2x.png')} />
                    </div>
                    {/* <div className="close_button">
                        <i class="fas fa-times"></i>
                    </div> */}
                    <button className="btn btn-complete" onClick={()=>{
                        var list = document.getElementsByTagName("canvas")
                        var dataURL = list[0].toDataURL('image/jpeg', 1.0);
                        uploadImage(dataURL)
                    }}>Post to story</button>
                </div>
            </div>
            <ImageEditor
                includeUI={{
                    loadImage: {
                        path: 'https://images.unsplash.com/photo-1616627690613-75df07578b45?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                        name: 'SampleImage',
                    },
                    theme: myTheme,
                    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
                    initMenu: 'filter',
                    uiSize: {
                        width: 'auto',
                        height: '100vh',
                    },
                    menuBarPosition: 'right',
                }}
                cssMaxHeight={500}
                cssMaxWidth={700}
                selectionStyle={{
                    cornerSize: 20,
                    rotatingPointOffset: 70,
                }}
                usageStatistics={true}
            />
        </div>
    );
};

export default PhotoEditor;