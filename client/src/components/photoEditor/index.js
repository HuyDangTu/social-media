import React from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import './photoEditor.scss';
const myTheme = {
  // Theme object to extends default dark theme.
};
// var pngUrl = canvas.toDataURL(); // PNG is the default

const photoEditor = () => {

    var canvas = document.getElementsByTagName("canvas")
    console.log(canvas)
    var arr = [].slice.call(canvas);
    console.log(arr)
    // var jpegUrl = canvas[0].toDataURL();
    // console.log(jpegUrl);
  
    return (

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
    );
};

export default photoEditor;