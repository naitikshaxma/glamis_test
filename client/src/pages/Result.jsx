import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { resultPopupState } from '../store/atoms/resultPopup';
import { useSetRecoilState } from 'recoil';
import avatar from '../assets/avatar.jpeg';

export default function Result() {
  const setResultPopup = useSetRecoilState(resultPopupState);
  const isOpen = useRecoilValue(resultPopupState);
  const onClose = () => {
    setResultPopup(false);

  }
  return (
    <>
    {/* a popup modal for result */}
    <Modal open={isOpen} onClose={onClose}>
      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Result Details</Typography>
          <Button onClick={onClose}>
            <Close />
          </Button>
        </div>
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full">
              <img src={avatar} alt="profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <div>
            <Typography>Name - Shubh Chaturvedi</Typography>
            <Typography>Uni Roll - 2115000976</Typography>
            <Typography>Subject - DBMS</Typography>
          </div>
        </div>
        <div className="flex justify-around mb-4">
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
            <Typography>Pie Chart</Typography>
          </div>
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
            <Typography>Line Chart</Typography>
          </div>
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
            <Typography>Line Chart</Typography>
          </div>
        </div>
        <Button variant="contained" color="primary" fullWidth>
          Detailed report
        </Button>
      </Box>
    </Modal>
    </>
  )
}
