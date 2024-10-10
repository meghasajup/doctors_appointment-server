import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { availability: !docData.availability })
        res.json({ success: true, message: "Availability changed successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API for doctor login
const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credential" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API to get appointment for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for mark the appointment completed 
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            res.json({ success: true, message: "Appointment completed" })
        } else {
            res.json({ success: false, message: "Invalid appointment" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API for mark the cancel appointment 
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            res.json({ success: true, message: "Appointment cancelled" })
        } else {
            res.json({ success: false, message: "Invalid appointment" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API to get doctor dashboard
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API for get doctor profile

const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Api for update the doctor profile
const updateDoctorProfile = async (req, res) => {
    try {

        const { docId, fees, address, availability } = req.body
        await doctorModel.findByIdAndUpdate(docId, { fees, address, availability })
        res.json({ success: true, message: 'Profile updated successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    updateDoctorProfile,
    doctorProfile
}