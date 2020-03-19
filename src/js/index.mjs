import Job from './Job.js';
import Jobs from './JobsList.js';

const JobController = new Job(
  Jobs,
  document.querySelector('.jobsList'),
  document.querySelector('.filterList')
);

JobController.printList();
