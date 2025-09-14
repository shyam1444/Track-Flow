import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Button } from '@mui/material';

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
    onDeleteLead?: (leadId: string) => void;
    onAddLead?: () => void;
}

// Define the possible stages for the Kanban view
const stages = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

const LeadKanban: React.FC<LeadKanbanProps> = ({ leads = [], onStageChange, onLeadClick, onDeleteLead, onAddLead }) => {
  const [leadsByStage, setLeadsByStage] = useState<{ [key: string]: Lead[] }>({});
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);

  useEffect(() => {
    // Group leads by stage whenever the leads prop changes
    const groupedLeads: { [key: string]: Lead[] } = {};
    stages.forEach(stage => {
      groupedLeads[stage] = leads.filter(lead => lead.stage === stage);
    });
    setLeadsByStage(groupedLeads);
  }, [leads]);

  const handleDragEnd = (result: DropResult) => {
    setDraggedOverStage(null);
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
    <DragDropContext
      onDragEnd={handleDragEnd}
      onDragUpdate={result => {
        setDraggedOverStage(result.destination?.droppableId || null);
      }}
    >
      <div className="kanban-board">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          {onAddLead && (
            <Button variant="contained" color="primary" onClick={onAddLead}>
              Add New Lead
            </Button>
          )}
        </div>
        {stages.map(stage => (
          <Droppable droppableId={stage} key={stage}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="kanban-column"
                style={{
                  background: draggedOverStage === stage ? '#f0f4ff' : undefined,
                  transition: 'background 0.2s',
                }}
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
                        style={{ ...provided.draggableProps.style, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, marginBottom: 8, background: '#fff' }}
                      >
                        <div style={{ flex: 1 }} onClick={() => onLeadClick(lead)}>
                          <h4 style={{ margin: 0 }}>{lead.name}</h4>
                          <p style={{ margin: 0, fontSize: 13 }}>{lead.contact}</p>
                          {lead.company && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{lead.company}</p>}
                        </div>
                        {Array.isArray((lead as any).documents) && (lead as any).documents.length > 0 && (
                          <span title={`Documents: ${(lead as any).documents.length}`} style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                            <InsertDriveFileIcon fontSize="small" style={{ marginRight: 2 }} />
                            <span style={{ fontSize: 12 }}>{(lead as any).documents.length}</span>
                          </span>
                        )}
                        {onDeleteLead && (
                          <IconButton
                            size="small"
                            aria-label="delete"
                            onClick={e => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
                                onDeleteLead(lead.id);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
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