import { Component, OnInit } from '@angular/core';
import { DataService } from '../api.service';
import { stringify } from 'node:querystring';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit {
  
  step = 1; // To track the current step
  userInput = ''; // Stores the current user input
  departments: any[] = [];
  doctors: any[] = [];
  timeSlots: any;
  selectedDepartment: any;
  selectedDoctor: any;
  selectedDate : any
  selectedTimeSlot: any;
  timeRange : string = "";
  appointmentInfo = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(private chatbotService: DataService) {}

  ngOnInit(): void {
    this.getDepartments();
  }

  // Fetch and display departments for the first step
  getDepartments(): void {
    this.chatbotService.getDepartments().subscribe((data) => {
      this.departments = data;
      this.step = 1; 
    });
  }

  // Process user input based on the current step
  processInput(): void {
      if(this.step === 1){
        const selectedDepartment = this.departments.find(
          dept => dept.id === +this.userInput || dept.name.toLowerCase() === this.userInput.toLowerCase()
        )
        if(selectedDepartment){
          this.selectedDepartment = selectedDepartment;
          this.getDoctors(selectedDepartment.id)
          this.userInput = ''
          this.step = 2
        }
        else{
          alert('please enter the valid input')
        }
      }
      else if(this.step === 2){
        const selectedDoctor = this.doctors.find(
          (doc, index) => doc.name.toLowerCase() === this.userInput.toLowerCase || index+1 === +this.userInput
        )

        if(selectedDoctor){
          this.selectedDoctor = selectedDoctor
          this.userInput = '';
          this.step = 3;
        }
        else {
          alert('please enter valid input')
        }
      }
      else if(this.step === 3){
        this.selectedDate = this.selectedDate
        if(this.selectedDate){
          this.getSlots(this.selectedDoctor.id, this.selectedDate)
          this.userInput = ''
          this.step = 4
        }
        else{
          alert('please enter date')
        }
      }
      else if(this.step === 4){ 
        const selectedTimeSlot = this.timeSlots.find(
          (slot : any, index : number) => index + 1 === +this.userInput || slot.timeSlots === this.userInput
        );
        if(selectedTimeSlot){
          this.selectedTimeSlot = selectedTimeSlot
          this.step = 5
          this.userInput = ''
        }
      }
      else if(this.step === 5){
        const pattern = /^[a-zA-Z\s]+$/
        const isValid = pattern.test(this.userInput)
        if(isValid){
          this.appointmentInfo.name = this.userInput
          this.step = 6
          this.userInput = ''
        }
      }
      else if(this.step === 6 ){
         const pattern = /^(?:\+91|91)?[6-9][0-9]{9}$/;
        const isvalid = pattern.test(this.userInput)
        if(isvalid){
          this.appointmentInfo.phone = this.userInput
          this.step = 7
          this.userInput = ''
        }
        else {
          alert("Enter valid phone number")
        }
      }
      else if(this.step === 7){
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        const isValid = pattern.test(this.userInput)
        if(isValid){
          this.appointmentInfo.email = this.userInput
          this.step = 8
          this.userInput = ''
        }
        else{
          alert('please enter the valid email')
        }
      }

      else if(this.step === 8){
        this.step = 9
      }
  }

  // getDoctors(departmentId: number): void {
  //   this.selectedDepartment = departmentId;
  //   this.doctors = this.doctors.filter(
  //       (doctor) => doctor.departmentId === departmentId
  //   );

  getDoctors(departmentId: number) {
    departmentId = this.selectedDepartment.id;
    this.chatbotService.getDoctors().subscribe((data) => {
        // Assuming data is an array of doctor objects
        this.doctors = data.filter((doctor : any) => doctor.departmentId === departmentId);
        this.step = 2;
    });
  }

  getSlots(doctorId: number, date: string ): void {
    this.chatbotService.getAvailableSlots(doctorId, date).subscribe(
        (data) => {
            this.timeSlots = data.availableFrom;
            console.log('Available slots:', this.timeSlots);

            const [startTime, endTime] = this.timeSlots.split('-')
            const [startHour, StartMin] = startTime.split(':').map(Number)
            const [endHour, endMin] = endTime.split(':').map(Number)


            const slots : any[] = [] 
            const date = new Date()

            date.setHours(startHour, StartMin || 0,0,0)

            while(date.getHours()<endHour || (date.getHours() && date.getMinutes() < endMin || 0)){
              slots.push(date.toTimeString().slice(0, 5));
              date.setMinutes(date.getMinutes() + 20);
            }

            this.timeSlots = slots
        },
        (error) => {
            console.error('Error fetching available slots:', error);
        }
    );
  }

}


