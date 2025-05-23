import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Lead {
  id: string;
  name: string;
  contact: string;
  company?: string;
  product_interest?: string;
  stage: string;
  follow_up_date?: string;
  notes?: string;
}

interface LeadKanbanProps {
    leads: Lead[];
    onStageChange: (leadId: string, newStage: string) => void;
    onLeadClick: (lead: Lead) => void;
}

// Define the possible stages for the Kanban view
const stages = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

const LeadKanban: React.FC<LeadKanbanProps> = ({ leads, onStageChange, onLeadClick }) => {
  const [leadsByStage, setLeadsByStage] = useState<{ [key: string]: Lead[] }>({});

  useEffect(() => {
    // Group leads by stage whenever the leads prop changes
    const groupedLeads: { [key: string]: Lead[] } = {};
    stages.forEach(stage => {
      groupedLeads[stage] = leads.filter(lead => lead.stage === stage);
    });
    setLeadsByStage(groupedLeads);
  }, [leads]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If the item is dropped outside of any droppable area
    if (!destination) {
      return;
    }

    // If the item is dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const leadId = draggableId;
    const newStage = destination.droppableId; // The droppableId is the stage name

    // Find the lead being dragged - this is now handled by the parent component (App.tsx)
    // We just need to call the onStageChange prop

    onStageChange(leadId, newStage);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {stages.map(stage => (
          <Droppable droppableId={stage} key={stage}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="kanban-column"
              >
                <h3>{stage}</h3>
                {leadsByStage[stage]?.map((lead, index) => (
                  <Draggable key={lead.id} draggableId={lead.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="kanban-card"
                        onClick={() => onLeadClick(lead)}
                        style={{ ...provided.draggableProps.style, cursor: 'pointer' }}
                      >
                        <h4>{lead.name}</h4>
                        <p>{lead.contact}</p>
                        {/* Display other key details */}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default LeadKanban; 