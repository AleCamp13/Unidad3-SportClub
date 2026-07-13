import * as assignmentService from './assignmentService'
import * as scheduleService from './scheduleService'
import { findReusableAssignment } from '../utils/classCreation'

export class ClassCreationError extends Error {
  constructor(cause, { assignmentCreated = false } = {}) {
    super(cause?.message || 'No fue posible crear la clase.', { cause })
    this.name = 'ClassCreationError'
    this.status = cause?.status
    this.errors = cause?.errors
    this.assignmentCreated = assignmentCreated
  }
}

export async function createClass(token, validated, assignments) {
  let assignment = findReusableAssignment(assignments, validated.assignment)
  const reusedAssignment = Boolean(assignment)

  if (!assignment) assignment = await assignmentService.createAssignment(token, validated.assignment)

  try {
    const schedule = await scheduleService.createSchedule(token, {
      ...validated.schedule,
      sport_room_id: Number(assignment.id),
    })
    return { assignment, schedule, reusedAssignment }
  } catch (cause) {
    throw new ClassCreationError(cause, { assignmentCreated: !reusedAssignment })
  }
}
