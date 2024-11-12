import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../api.service';
// import { stringify } from 'querystring';
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { environment } from '../environment';
// import { response } from 'express';

@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html',
  styleUrls: ['./ui.component.css'],
})
export class UIComponent implements OnInit {

  @ViewChild('bodyWrapper') bodyWrapper!: ElementRef;
  // variables
  isProcessing: boolean = false; // diaables the input field
  step: number = 0; // Initialize step
  services: any[] = [];
  servicesOption: any;
  userInput: any;
  departments: any[] = [];
  selectedDepartment: any;
  responseStructure: any = [
    {
      heading: '',
      option: [],
      input: ''
    },
  ];
  doctors: any;
  selectedDoctors: any;
  date: any;
  selectedDate: any;
  timeSlots: any
  selectedTimeSlot: any
  userInfo: any = {
    name: '',
    phone: ''
  }
  selectedfile: File | null = null
  doorservices: any = ['Pharmacy', 'Blood sample collection']
  selectedDoorservice: any
  address: any


  constructor(private chatbotService: DataService) { }

  // ngOnInit
  ngOnInit(): void {
    this.showInitialOptions();
  }

  // sfterviewchecked
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // initial values
  showInitialOptions(): void {
    this.services = ['Door step delivery', 'Book an Appointment', 'Emergency'];
    const newEntry = {
      heading: "Namaste! Welcome to Rashtrotthana Hospital's appointment booking service. How may we assist you today? Please select a service by entering its number:",
      option: [...this.services],
    };
    this.responseStructure.push(newEntry);
    this.servicesOption = 0;
  }

  // button handler
  async buttonHandler(): Promise<void> {
    this.isProcessing = true; // Disable button

    try {
        if (this.servicesOption === 0) {
            if (this.userInput <= this.services.length && this.userInput != 0) {
                this.servicesOption = parseInt(this.userInput);
            }
        }

        // appointment module
        if (this.servicesOption === 2) {
            await this.appointmentHandler(); // Await async function
        }

        // getting department and displaying doctors
        else if (this.step === 1) {
            const selectedDepartment = this.departments.find(
                (dept, index) =>
                    index + 1 === +this.userInput ||
                    dept.name.toLowerCase() === this.userInput.toLowerCase()
            );
            if (selectedDepartment) {
                await this.getDoctors(selectedDepartment.id); // Await async function
            }
        }

        // getting doctors and displaying dates
        else if (this.step === 2) {
            await this.getDate(); // Await async function
        }

        else if (this.step === 3) {
            await this.getSlots(this.selectedDoctors.id, this.date); // Await async function
        }

        else if (this.step === 4) {
            await this.getUserName(); // Await async function
        }

        else if (this.step === 5) {
            await this.getPhoneNumber(); // Await async function
        }

        else if (this.step === 6) {
            await this.verifyingPnoneNumber(); // Await async function
        }

        else if (this.step === 7) {
            await this.createAppointment()
            await this.appointmentMail(); // Await async function
        }

        // doorstep delivery
        else if (this.servicesOption === 1) {
            await this.doorStepDelivery(); // Await async function
        }

        else if (this.step === 12) {
            await this.gettingDoorStepService(); // Await async function
        }

        else if (this.step === 14) {
            await this.getNameDoorStep(); // Await async function
        }

        else if (this.step === 15) {
            await this.getAddress(); // Await async function
        }

        else if (this.step === 16) {
            await this.gettingNumberDoorStep(); // Await async function
        }

        else if (this.step === 17){
          await this.doorStepMail()
        }

        else if (this.servicesOption === 3) {
          this.emergency(); // Await async function
      }

        else {
            alert('Please enter a valid input');
        }
    } catch (error) {
        console.error('Error in buttonHandler:', error);
    } finally {
        this.isProcessing = false; // Re-enable button after all operations are complete
    }
}

  // Appointment Booking
  appointmentHandler(): void {
    this.chatbotService.getDepartments().subscribe((data) => {
      this.departments = data;

      const newEntry = {
        heading: 'You have selected to book an appointment. Choose a Department by entering its number',
        option: [...this.departments.map((dept: any) => dept.name.toLowerCase())],
        input: this.userInput
      };
      this.responseStructure.push(newEntry);

      this.userInput = '';
      this.servicesOption = '';
      this.step = 1;
    });
  }

  // getting department and displaying doctors
  getDoctors(departmentId: number): void {
    const selectedDepartment = this.departments.find(
      (dept, index) =>
        index + 1 === +this.userInput ||
        dept.name.toLowerCase() === this.userInput.toLowerCase()
    );

    if (selectedDepartment) {
      this.selectedDepartment = selectedDepartment;

      this.chatbotService.getDoctors().subscribe((data) => {
        this.doctors = data.filter(
          (doctor: any) => doctor.departmentId === departmentId
        );

        const doctorEntry = {
          heading: `You chose ${this.selectedDepartment.name}. Please choose a doctor by entering their number`,
          option: this.doctors.map((doc: any) => doc.name),
          input: this.userInput
        };
        this.responseStructure.push(doctorEntry);

        this.step = 2;
        this.userInput = '';
      });
    }
    else{
      alert("please enter valid doctor")
    }
  }

  // getting doctors and displaying date
  getDate(): void {
    const selectedDoctor = this.doctors.find(
      (doc: any, index: number) => index + 1 === +this.userInput ||
        doc.name.toLowerCase() === this.userInput.toLowerCase()
    );

    if (selectedDoctor) {
      this.selectedDoctors = selectedDoctor;
      console.log('Selected Doctor:', this.selectedDoctors);

      const dateEntry = {
        heading: `You selected ${this.selectedDoctors.name}. Now, please enter your preferred appointment date`,
        option: [], // No options for date, just input
        input: this.selectedDoctors.name
      };
      this.responseStructure.push(dateEntry);
      this.step = 3;
      this.userInput = '';
    }
  }


  //getting time slot
  getSlots(doctorId: number, date: string): void {
    this.chatbotService.getAvailableSlots(doctorId, date).subscribe(
      (data) => {
        this.timeSlots = data.availableFrom;
        const slotDuration = parseInt(data.slotDuration);
        console.log('Available slots:', this.timeSlots);

        const [startTime, endTime] = this.timeSlots.split('-');
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const slots: any[] = [];
        const currentDate = new Date();

        currentDate.setHours(startHour, startMin || 0, 0, 0);

        while (
          currentDate.getHours() < endHour ||
          (currentDate.getHours() === endHour && currentDate.getMinutes() < endMin)
        ) {
          slots.push(currentDate.toTimeString().slice(0, 5));
          currentDate.setMinutes(currentDate.getMinutes() + slotDuration);
        }

        this.timeSlots = slots;

        const newEntry = {
          heading: `You entered ${this.date} as your appointment date. Now, please select a time slot from the available options by entering its number`,
          option: this.timeSlots.map((slot: any) => slot),
          input: this.date
        };

        this.responseStructure.push(newEntry);
        this.step = 4;
        this.userInput = '';
      },
      (error) => {
        console.error('Error fetching available slots:', error);
        alert('Failed to fetch available slots');
      }
    );
  }


  //getting userName
  getUserName(): void {
    const selectedTimeSlot = this.timeSlots.find(
      (slot: any, index: any) => index + 1 === +this.userInput
    )

    if (selectedTimeSlot) {
      this.selectedTimeSlot = selectedTimeSlot
      const newEntry = {
        heading: `You chose ${this.selectedTimeSlot} AM as your appointment slot. Please enter your full name for the appointment..`,
        option: '',
        input: this.selectedTimeSlot
      }

      this.responseStructure.push(newEntry)

      this.step = 5
      this.userInput = ''
    }
  }

  //getting phone number
  getPhoneNumber(): void {
    const pattern = /^[a-zA-Z\s]+$/;
    const isvalid = pattern.test(this.userInput)
    if (isvalid) {
      this.userInfo.name = this.userInput

      const newEntry = {
        heading: `You entered ${this.userInfo.name} as your name. Next, please enter your phone number.`,
        option: '',
        input: this.userInfo.name
      }

      this.responseStructure.push(newEntry)

      this.step = 6
      this.userInput = ''
    }
    else {
      alert("please enter valid name")
    }
  }

  //verifying phonenumber
  verifyingPnoneNumber(): void {
    const pattern = /^[6-9][0-9]{9}$/;
    const isvalid = pattern.test(this.userInput)
    if (isvalid) {
      this.userInfo.phone = `91${this.userInput}`

      const newEntry = {
        heading: `You entered ${this.userInfo.phone} as your phone number. We will now send an OTP for verification. Please enter the OTP`,
        option: '',
        input: this.userInfo.phone
      }

      this.responseStructure.push(newEntry)

      this.step = 7
      this.userInput = ''
    }
    else {
      alert("Please enter valid phoneNumber")
    }
  }

  // Doorstep delivery
  doorStepDelivery(): void {
    if (this.userInput === '1' || this.services[0].toLowerCase() === this.userInput.toLowerCase()) {
      const newEntry = {
        heading: 'You have selected doorstep delivery service. Please select the type of service by entering its number:',
        option: this.doorservices,
        input: 'Door Step Delivery'
      };
      this.servicesOption = ''
      this.responseStructure.push(newEntry);
      this.userInput = '';
      this.step = 12;

    }

  }

  // getting door step delivery
  gettingDoorStepService(): void {
    if (this.userInput === '1' || this.userInput.toLowerCase() === "pharmacy") {
      this.selectedDoorservice = "Pharmacy";
      const newEntry = {
        heading: "You selected Pharmacy.  Please upload your prescription to proceed.",
        input: this.selectedDoorservice
      };
      this.responseStructure.push(newEntry);
      this.step = 13;
    } else if (this.userInput === '2' || this.userInput.toLowerCase() === "blood sample collection") {
      this.selectedDoorservice = "Blood Sample Collection";
      const newEntry = {
        heading: "You selected Blood Sample Collection.  Please upload your prescription to proceed.",
        input: this.selectedDoorservice
      };
      this.responseStructure.push(newEntry);
      this.step = 13;
    } else {
      alert("Please enter a valid input");
    }
  }

  // getting an image
  getImage(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedfile = fileInput.files[0];
    }

    if (this.selectedfile) {
      this.chatbotService.postImage(this.selectedfile).subscribe(
        (response) => {
          console.log("image uploaded successfully", response)
        },
        (error) => {
          console.log("falied to upload image", error)
        }
      )

      this.userInput = ''
      const newEntry = {
        heading: "Thank you! Your prescription has been received. Now, please provide the following details to complete the service request. Enter your full name.",
        option: "",
        input: "Image uploaded successfully"
      }

      this.responseStructure.push(newEntry)

      this.step = 14
    }
    else{
      alert("Please upload the valid file")
    }
  }

  // getting name for door step
  getNameDoorStep(): void { 
    const pattern = /^[a-zA-Z\s]+$/;
    const isvalid = pattern.test(this.userInput)
    if (isvalid) {
      
      this.userInfo.name = this.userInput

      const newEntry = {
        heading: [`You entered ${this.userInfo.name} as your name. Please enter your delivery address.`,"( Note : Pharmacy delivery is free within a 5km radius of Rashtrotthana Hospital. For locations beyond 5 km, delivery charges will apply)",],
        option: '',
        input: this.userInfo.name
      }

      this.responseStructure.push(newEntry)

      this.step = 15
      this.userInput = ''
    }
    else {
      alert("Please enter the valid name")
    }
  }

  getAddress(): void {
    const pattern = /^[a-zA-Z0-9\s,.'-]{3,100}$/;
    const isvalid = pattern.test(this.userInput)

    if (isvalid) {
      this.address = this.userInput

      const newEntry = {
        heading: `Enter Your Phone Number`,
        option: "",
        input: this.address
      }

      this.responseStructure.push(newEntry)

      this.step = 16
      this.userInput = ''
    }
    else {
      console.log("Please enter the valid address")
    }
  }

  // getting number for door step delivery
  gettingNumberDoorStep(): void {
    const pattern = /^[6-9][0-9]{9}$/;
    const isvalid = pattern.test(this.userInput)
    if (isvalid) {
      this.userInfo.phone = `91${this.userInput}`

      const newEntry = {
        heading: `You entered ${this.userInfo.phone} as your phone number. We will now send an OTP for verification.`,
        option: '',
        input: this.userInfo.phone
      }

      this.responseStructure.push(newEntry)

      this.step = 17
      this.userInput = ''
    }
    else {
      alert("please enter valid phone number")
    }
  }

  //appointment email
  appointmentMail(): void {
    console.log("doctor", this.selectedDoctors, "user",this.userInfo)
    const formdata = {
      doctorName : this.selectedDoctors.name,
      doctorDesignation : this.selectedDepartment.name,
      patientName : this.userInfo.name,
      patientContact : this.userInfo.phone,
      appointmentDate : this.date,
      appointmentTime : this.selectedTimeSlot
    }

    console.log(formdata)
    console.log("email sent")

    this.chatbotService.appointMail(formdata).subscribe(
      (res) => {
        console.log('Email sent successfully', res);
        alert('Email sent successfully');
      },
      (err) => {
        console.error('Error sending email', err);
        alert('Failed to send email');
      }
    );
  }    
  
  //doorstepemail
  doorStepMail() : void{

    if (!this.selectedfile) {
      alert('Please select a file');
      return;
    }

    const formdata = new FormData
    formdata.append('name', this.userInfo.name);
    formdata.append('contact', this.userInfo.phone);
    formdata.append('address', this.address);
    formdata.append('file', this.selectedfile);


    console.log(formdata)

    this.chatbotService.doorstepmail(formdata).subscribe(
    (res) => {
      console.log('Email sent successfully', res);
      alert('Email sent successfully');
    },
    (err) => {
      console.error('Error sending email', err);
      alert('Failed to send email');
    })
  }

  //emergency
  emergency() : void{
    const newEntry = {
      heading : "In case of any medical emergency, please reach out to our 24/7 helpline: [Insert Emergency Number Here]",
      options : "",
      input : "Emergency"
    }

    this.responseStructure.push(newEntry)
  }

  //create appointment
  createAppointment() :void{
    const appointmentData = {
      patientName: this.userInfo.name,
      phoneNumber: this.userInfo.phone,
      email: '',
      doctorId: this.selectedDoctors.id,
      doctorName: this.selectedDoctors.name,
      department: this.selectedDepartment.name,
      date: this.date,
      time: this.selectedTimeSlot,
      requestVia: 'chatbot'
    };

    this.chatbotService.createAppointment(appointmentData).subscribe(
      (res) => {
        res.send({success : true, message : "appointment booked successfully"})
        console.log(appointmentData)
      },
      (err) => {
        // con({success : false, message : "failed to book an appointment"})
        console.log(err)
      }
    )
  }

  //auto scroll down
  scrollToBottom(): void {
    if (this.bodyWrapper) {
      this.bodyWrapper.nativeElement.scrollTop = this.bodyWrapper.nativeElement.scrollHeight;
    }
  }
}