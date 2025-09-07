import emailjs from '@emailjs/browser';

emailjs.init("CaYNOAiNaenBRf6ga");

export const sendRegistrationNotification = async (eventData, userData, registrationType = 'regular') => {
  try {
    const formattedDate = eventData?.date
    ? new Date(eventData.date).toLocaleDateString("en-GB")
    : "N/A";  
    const formattedTime = `${eventData?.startTime} - ${eventData?.endTime}`;

    const templateParams = {
      event_title: eventData?.title || "Unknown Event",
      event_date: formattedDate,
      event_time: formattedTime,
      user_name: userData?.fullName || "Anonymous User",
      user_email: userData?.email || "No Email Provided",
      user_phone: userData?.phoneNumber || "Not Provided",
      registration_type: registrationType,
      registration_time: new Date().toLocaleString("en-GB"),
      current_capacity: registrationType === 'regular' 
        ? `${(eventData?.registrations || []).length}/${eventData?.capacity || "N/A"}`
        : `${(eventData?.standbyRegistrations || []).length}/${eventData?.standbyCapacity || "N/A"}`
    };

    const response = await emailjs.send(
      'service_jv9pbhi', 
      'template_7fcz2au', 
      templateParams,
      'CaYNOAiNaenBRf6ga' 
    );

    console.log("Email notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};
