import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

const FreelanceKYC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Owner Fields
    ownerAadharName: '',
    ownerAadharNumber: '',
    ownerAadharDob: '',
    ownerPanName: '',
    ownerPanNumber: '',
    city: '',
    pincode: '',
    houseno: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleNumber: '',

    // Step 2: Driver Fields
    driverAadharName: '',
    driverAadharNumber: '',
    driverAadharDob: '',
    driverLicenceNumber: '',
    driverLicenceDob: '',
    driverLicenceType: '',
    driverLicenceExpiry: '',
  });

  const [files, setFiles] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key.startsWith('owner') || ['city', 'pincode', 'houseno', 'vehicleType', 'vehicleBrand', 'vehicleModel', 'vehicleNumber'].includes(key)) {
        data.append(key, formData[key]);
      }
    });

    // Append Files for Step 1
    const step1Files = ['ownerAadharFront', 'ownerAadharBack', 'ownerPanFront', 'ownerSelfie', 'agreementImage', 'lightbillImage', 'rcImage', 'insuranceImage', 'pucImage'];
    step1Files.forEach(field => {
      if (files[field]) data.append(field, files[field]);
    });

    try {
      const res = await axios.post('http://localhost:7000/api/kyc/freelance/step1', data, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(res.data.message);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting Owner details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key.startsWith('driver')) {
        data.append(key, formData[key]);
      }
    });

    // Append Driver Files
    const step2Files = ['driverAadharFront', 'driverAadharBack', 'driverLicenceFront', 'driverLicenceBack', 'driverSelfie'];
    step2Files.forEach(field => {
      if (files[field]) data.append(field, files[field]);
    });

    try {
      const res = await axios.post('http://localhost:7000/api/kyc/freelance/step2', data, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(res.data.message);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting Driver details");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-white">KYC Submitted Successfully!</h2>
          <p className="text-gray-400 mt-3">Your Freelance Driver KYC is under review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Freelance Driver KYC</h1>
        <div className="text-sm text-indigo-400">Step {step} of 2</div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full mb-8">
        <div className={`h-2 bg-indigo-600 rounded-full transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmitStep1} className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">Step 1: Vehicle Owner Details</h2>

          {/* Owner Personal Info */}
          <div className="grid grid-cols-2 gap-6">
            <input type="text" name="ownerAadharName" placeholder="Owner Aadhaar Name" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="ownerAadharNumber" placeholder="Owner Aadhaar Number" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="date" name="ownerAadharDob" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="ownerPanName" placeholder="Owner PAN Name" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="ownerPanNumber" placeholder="Owner PAN Number" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
          </div>

          {/* Address & Vehicle */}
          <div className="grid grid-cols-2 gap-6">
            <input type="text" name="city" placeholder="City" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="pincode" placeholder="Pincode" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="vehicleBrand" placeholder="Vehicle Brand" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="vehicleModel" placeholder="Vehicle Model" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="vehicleNumber" placeholder="Vehicle Number" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
          </div>

          {/* File Uploads - Step 1 */}
          <div className="grid grid-cols-2 gap-6">
            {['ownerAadharFront', 'ownerAadharBack', 'ownerPanFront', 'ownerSelfie', 'agreementImage', 'lightbillImage', 'rcImage', 'insuranceImage', 'pucImage'].map(field => (
              <div key={field}>
                <label className="block text-sm text-gray-400 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input type="file" name={field} onChange={handleFileChange} required className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:bg-indigo-600 file:text-white" />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg">
            {loading ? 'Submitting...' : 'Submit Owner Details → Step 2'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitStep2} className="space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep(1)} className="text-indigo-400 hover:text-white">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-semibold text-white">Step 2: Driver Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input type="text" name="driverAadharName" placeholder="Driver Aadhaar Name" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="driverAadharNumber" placeholder="Driver Aadhaar Number" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="date" name="driverAadharDob" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
            <input type="text" name="driverLicenceNumber" placeholder="Driver Licence Number" onChange={handleInputChange} required className="bg-[#1a1a1f] p-4 rounded-2xl" />
          </div>

          {/* Driver Files */}
          <div className="grid grid-cols-2 gap-6">
            {['driverAadharFront', 'driverAadharBack', 'driverLicenceFront', 'driverLicenceBack', 'driverSelfie'].map(field => (
              <div key={field}>
                <label className="block text-sm text-gray-400 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input type="file" name={field} onChange={handleFileChange} required className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:bg-indigo-600 file:text-white" />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-lg">
            {loading ? 'Submitting...' : 'Submit Final KYC'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FreelanceKYC;