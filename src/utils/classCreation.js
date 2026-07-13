import { validateAssignment, validateSchedule } from './schedulingValidation'

export function validateClassCreation(input) {
  const assignmentResult = validateAssignment(input)
  const scheduleResult = validateSchedule({ ...input, sport_room_id: 1 })
  const schedule = { ...scheduleResult.data }
  delete schedule.sport_room_id

  return {
    isValid: assignmentResult.isValid && scheduleResult.isValid,
    errors: { ...assignmentResult.errors, ...scheduleResult.errors },
    assignment: assignmentResult.data,
    schedule,
  }
}

export function findReusableAssignment(assignments, assignment) {
  return (assignments || []).find((candidate) => (
    candidate.status !== false
    && Number(candidate.sport_id) === Number(assignment.sport_id)
    && Number(candidate.room_id) === Number(assignment.room_id)
    && Number(candidate.coach_id) === Number(assignment.coach_id)
  ))
}
