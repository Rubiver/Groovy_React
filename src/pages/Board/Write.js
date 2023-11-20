import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './Write.module.css';
import axios from 'axios';
import ReactQuill from './ReactQuill';
import { LoginContext } from '../../App';
import { MemberContext } from '../Groovy/Groovy';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { useWebSocket } from '../../WebSocketContext/WebSocketContext';

function Write() {
  const { member } = useContext(MemberContext);

  const [board, setBoard] = useState({});
  const [files, setFiles] = useState([]);
  const navi = useNavigate();
  const { loginID } = useContext(LoginContext);
  const stompClient = useWebSocket();

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navi(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    setFiles(Array.from(selectedFiles));
  };

  const handleAdd = () => {

    if (!board.title) {
      alert("제목을 입력하세요.");
      return;
    }

    if (!board.comDept) {
      alert("전사/부서를 선택하세요.");
      return;
    }

    if (!board.category) {
      alert("공지/자유를 선택하세요.");
      return;
    }
    const trimContent = board.contents.trim();
    if (!trimContent) {
      alert("내용을 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append('writer', loginID);
    formData.append('title', board.title);
    formData.append('contents', trimContent);
    formData.append('category', board.category);
    formData.append('dept', member.group_name);

    files.forEach((file) => {
      formData.append(`files`, file);
    });

    if (board.comDept === 'com') {
      axios
        .post('/api/boards', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((resp) => {
          if (board.category === '공지') {
            if (stompClient) {
              stompClient.send("/app/board", {}, '공지가 등록되었습니다.');
            }
          }
          navi('/groovy/board');
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (board.comDept === 'dept') {
      axios
        .post('/api/boards/dept', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((resp) => {
          navi('/groovy/board');
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  return (
    <div className="boardContainer">
      <div className={style.write}>글쓰기</div>
      <hr></hr>
      <div className={style.margin}>
        제목
        <input
          type="text"
          placeholder="제목"
          name="title"
          onChange={handleChange}
          value={board.title}
          className={style.title}
        />
        <br />
        <hr></hr>
        <div className={style.fileList}>
          파일 첨부
          <Button
            sx={{ width: '10%', marginLeft: '29px' }}
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Upload
            <input
              type="file"
              onChange={handleFileChange}
              className={style.file}
              style={{ display: 'none' }}
              multiple
            />
          </Button>
          <List
            sx={{ width: '50%', bgcolor: 'background.paper', marginLeft: "30px" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
          >
            <ListItemButton onClick={handleClick}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="업로드 파일 목록" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {files.length > 0 && (
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          {files.map((file, index) => (
                            <ListItemButton key={index} sx={{ pl: 4 }}>
                              <ListItemText primary={file.name} />
                            </ListItemButton>
                          ))}
                        </React.Fragment>
                      }
                    />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </List>
        </div>
        <hr></hr>
        <div className={style.select}>
          <div>
            전사/부서
            <select name="comDept" onChange={handleChange} value={board.comDept} className={style.category}>
              <option value="">선택</option>
              <option value="com">전사</option>
              <option value="dept">부서</option>
            </select>
          </div>
          <div className={style.comFree}>
            공지/자유
            <select name="category" onChange={handleChange} value={board.category} className={style.category}>
              <option value="">선택</option>
              <option value="공지">공지</option>
              <option value="자유">자유</option>
            </select>
          </div>
        </div>
      </div>
      <hr></hr>
      <div className={style.editor}>
        <ReactQuill id="editor" value={board.contents} setValue={(value) => setBoard({ ...board, contents: value })} style={{ height: "325px", width: "100%" }} />
      </div>
      <hr></hr>
      <div className={style.btn}>
        <button onClick={handleBack}>취소</button>
        <button onClick={handleAdd}>등록</button>
      </div>
    </div>
  );
}

export default Write;
