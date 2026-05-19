export const getDisplayName = (item) =>
  item.aadhar?.name || item.ownerAadhar?.name || item.driverAadhar?.name ||
  item.driverAadharName || item.ownerAadharName || item.fullName || item.name || 'Partner Identity';

export const getAllImages = (item) => {
  const imgs = [];
  if (item.kycType === 'Owner_driver') {
    if (item.aadhar?.frontImage  || item.aadharFront)   imgs.push(item.aadhar?.frontImage  || item.aadharFront);
    if (item.aadhar?.backImage   || item.aadharBack)    imgs.push(item.aadhar?.backImage   || item.aadharBack);
    if (item.pan?.frontImage     || item.panFront)      imgs.push(item.pan?.frontImage     || item.panFront);
    if (item.licence?.frontImage || item.licenceFront)  imgs.push(item.licence?.frontImage || item.licenceFront);
    if (item.profileImage)                              imgs.push(item.profileImage);
    if (item.vehicleDocs?.rcImage || item.rcImage)      imgs.push(item.vehicleDocs?.rcImage || item.rcImage);
  } else {
    if (item.ownerSelfie)                                         imgs.push(item.ownerSelfie);
    if (item.driverSelfie)                                        imgs.push(item.driverSelfie);
    if (item.ownerAadhar?.frontImage  || item.ownerAadharFront)  imgs.push(item.ownerAadhar?.frontImage  || item.ownerAadharFront);
    if (item.driverAadhar?.frontImage || item.driverAadharFront) imgs.push(item.driverAadhar?.frontImage || item.driverAadharFront);
    if (item.vehicleDocs?.rcImage || item.rcImage)               imgs.push(item.vehicleDocs?.rcImage || item.rcImage);
  }
  return [...new Set(imgs)].filter(url => typeof url === 'string' && url.startsWith('http'));
};