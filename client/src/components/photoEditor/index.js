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


const photoEditor = () => {

    return (
        <div className="wrapper">
            <button onClick={()=>{
                var list = document.getElementsByTagName("canvas")
                //console.log(list);
                //console.log(list[0]);
                var dataURL = list[0].toDataURL('image/jpeg', 1.0);
                //console.log(dataURL);
                uploadImage(dataURL)
            }}>
                click
            </button>

            <img src="data:image/jpeg;base64,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"/>
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

export default photoEditor;