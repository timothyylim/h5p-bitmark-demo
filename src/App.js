import logo from './logo.svg';
import './App.css';

import { useState, useMemo } from 'react';

import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { useDropzone } from 'react-dropzone';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#535353',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function App() {
  const [bitmarkFile, setBitmarkFile] = useState(null)

  const { acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop: acceptedFiles => {
      let reader = new FileReader();
      reader.readAsDataURL(acceptedFiles[0]);
      reader.onload = (e) => {
        const f = e.target.result
        JSZipUtils.getBinaryContent(f, function (err, data) {
          if (err) {
            throw err;
          }
          const jsZip = new JSZip();
          jsZip.loadAsync(data).then(function (zip) {
            zip.file("content/content.json")
              .async("string")
              .then(data => {
                const d = JSON.parse(data)
                console.log(data)

                const markup = `[.true-false-1]\n [+${d.question}]`
                const isCorrect = JSON.parse(d.correct)

                setBitmarkFile(
                  {
                    "markup": markup,
                    "bit": {
                      "type": ".true-false-1",
                      "format": "text",
                      "item": "",
                      "lead": "",
                      "instruction": "",
                      "hint": "",
                      "statement": d.question,
                      "isCorrect": isCorrect,
                      "isExample": false,
                    }
                  }
                )
              })
          })
        })
      };
    }
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);


  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path}
    </li>
  ));

  return (
    <div className="App">
      <nav role="full-horizontal">
        <ul>
          <li>H5P Bitmark Converter</li>
        </ul>
      </nav>
      <header className="App-header">
        <div className='content'>

          <h1>
            Convert your H5P content types to Bit JSON
          </h1>

          <p>This is a prototype H5P to Bitmark converter. Currently it only supports the <a href='https://h5p.org/true-false' target="_blank">‘True / False’ content type</a>.</p>

          <section className="container">
            <div {...getRootProps({ style })}>
              <input {...getInputProps()} />
              <p>Drag and drop a .h5p content type here</p>
            </div>
          </section>

          {bitmarkFile &&
            <>
              <h4>Files</h4>
              <ul>{files}</ul>
              <div className='code'>
                <pre>{JSON.stringify(bitmarkFile, null, 2)}</pre>
              </div>
            </>
          }
        </div>
        <p>made by <a href='https://www.timothylim.is' target="_blank">Timothy Lim</a></p>
      </header>
    </div>
  );
}

export default App;

// https://stackoverflow.com/questions/58455543/how-do-you-unzip-a-string-in-react
// https://stackoverflow.com/questions/60280871/download-a-zip-file-in-reactjs-without-any-plugins