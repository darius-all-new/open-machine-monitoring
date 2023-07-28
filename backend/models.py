'''
OpenMachineMonitoring

This file is part of OpenMachineMonitoring.

OpenMachineMonitoring is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

OpenMachineMonitoring is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with OpenMachineMonitoring. If not, see <https://www.gnu.org/licenses/>
'''

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, JSON, DateTime
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String, index=True)
    model = Column(String, index=True)
    topic = Column(String, index=True)
    status = Column(String, index=True)
    usage_data = Column(JSON)

    usage_records = relationship("UsageRecord", back_populates="asset")
    # time_on = Column(Float)
    # time_off = Column(Float)
    # time_idle = Column(Float)
    # time_on_week = Column(Float)
    # time_off_week = Column(Float)
    # time_idle = Column(Float)

class UsageRecord(Base):
    __tablename__ = "usagerecords"

    id = Column(Integer, primary_key=True, index=True)
    time_on = Column(Float)
    time_off = Column(Float)
    time_idle = Column(Float)
    date = Column(DateTime)
    asset_id = Column(Integer, ForeignKey("assets.id"))

    asset = relationship("Asset", back_populates="usage_records")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    day_duration = Column(Float)
    week_start = Column(String)
